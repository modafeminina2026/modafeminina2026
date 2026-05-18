export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  original_price: number | null
  category_id: string | null
  images: string[]
  stock: number
  featured: boolean
  active: boolean
  sizes: string[] | null
  colors: string[] | null
  brand: string | null
  available_for_pickup: boolean
  created_at: string
  categories?: { name: string; slug: string } | null
}

export interface ProductFilters {
  category?: string        // category_id
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  size?: string
  sizes?: string[]
  availableForPickup?: boolean
  pickupOnly?: boolean
  search?: string
  sort?: string
  featured?: boolean
}

const PAGE_SIZE = 12

export function useProducts() {
  const client = useSupabaseClient()

  // Reactive state for pages that use the stateful API
  const products = ref<Product[]>([])
  const loading = ref(false)
  const hasMore = ref(false)
  const currentPage = ref(0)
  const currentFilters = ref<ProductFilters>({})

  const LISTING_FIELDS = 'id, name, slug, price, original_price, images, stock, featured, available_for_pickup, sizes, colors, brand, category_id, categories(name, slug)'

  async function _query(filters: ProductFilters, page: number): Promise<Product[]> {
    let query = client
      .from('products')
      .select(LISTING_FIELDS)
      .eq('active', true)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    // Category by ID
    if (filters.category) {
      query = query.eq('category_id', filters.category)
    }

    // Category by slug
    if (filters.categorySlug && !filters.category) {
      const { data: cat } = await client
        .from('categories')
        .select('id')
        .eq('slug', filters.categorySlug)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice)
    if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice)
    if (filters.availableForPickup || filters.pickupOnly) query = query.eq('available_for_pickup', true)
    if (filters.featured) query = query.eq('featured', true)
    if (filters.search) query = query.ilike('name', `%${filters.search}%`)

    const sizeFilter = filters.size || (filters.sizes?.length ? filters.sizes[0] : undefined)
    if (sizeFilter) query = query.contains('sizes', [sizeFilter])

    switch (filters.sort) {
      case 'price_asc':  query = query.order('price', { ascending: true }); break
      case 'price_desc': query = query.order('price', { ascending: false }); break
      case 'newest':     query = query.order('created_at', { ascending: false }); break
      default:           query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as Product[]
  }

  // Stateful fetch — resets products list
  async function fetchProducts(filters: ProductFilters = {}) {
    loading.value = true
    currentPage.value = 0
    currentFilters.value = filters
    try {
      const data = await _query(filters, 0)
      products.value = data
      hasMore.value = data.length === PAGE_SIZE
    } catch {
      products.value = []
      hasMore.value = false
    } finally {
      loading.value = false
    }
  }

  // Load more — appends to products list
  async function loadMore() {
    if (!hasMore.value || loading.value) return
    loading.value = true
    currentPage.value++
    try {
      const data = await _query(currentFilters.value, currentPage.value)
      products.value.push(...data)
      hasMore.value = data.length === PAGE_SIZE
    } catch {
      hasMore.value = false
    } finally {
      loading.value = false
    }
  }

  // Stateless helpers (for components that manage their own state)
  async function fetchProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await client
      .from('products')
      .select('*, categories(name, slug)')
      .eq('slug', slug)
      .eq('active', true)
      .single()
    if (error) return null
    return data as Product
  }

  async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
    const { data, error } = await client
      .from('products')
      .select(LISTING_FIELDS)
      .eq('active', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as Product[]
  }

  async function fetchProductsByCategory(categorySlug: string, page = 0): Promise<Product[]> {
    return _query({ categorySlug }, page)
  }

  return {
    // Reactive state
    products,
    loading,
    hasMore,
    // Stateful methods
    fetchProducts,
    loadMore,
    // Stateless helpers
    fetchProductBySlug,
    fetchFeaturedProducts,
    fetchProductsByCategory,
    PAGE_SIZE,
  }
}
