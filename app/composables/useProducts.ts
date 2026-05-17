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
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  availableForPickup?: boolean
  search?: string
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'featured'
  featured?: boolean
}

const PAGE_SIZE = 12

export function useProducts() {
  const client = useSupabaseClient()

  const LISTING_FIELDS = 'id, name, slug, price, original_price, images, stock, featured, available_for_pickup, sizes, colors, brand, category_id, categories(name, slug)'

  async function fetchProducts(filters: ProductFilters = {}, page = 0) {
    let query = client
      .from('products')
      .select(LISTING_FIELDS)
      .eq('active', true)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (filters.categorySlug) {
      const { data: cat } = await client
        .from('categories')
        .select('id')
        .eq('slug', filters.categorySlug)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice)
    if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice)
    if (filters.availableForPickup) query = query.eq('available_for_pickup', true)
    if (filters.featured) query = query.eq('featured', true)
    if (filters.search) query = query.ilike('name', `%${filters.search}%`)
    if (filters.sizes?.length) query = query.overlaps('sizes', filters.sizes)

    switch (filters.sort) {
      case 'price_asc':  query = query.order('price', { ascending: true });  break
      case 'price_desc': query = query.order('price', { ascending: false }); break
      case 'newest':     query = query.order('created_at', { ascending: false }); break
      default:           query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as Product[]
  }

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
    return fetchProducts({ categorySlug }, page)
  }

  return {
    fetchProducts,
    fetchProductBySlug,
    fetchFeaturedProducts,
    fetchProductsByCategory,
    PAGE_SIZE,
  }
}
