export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.appUrl || 'https://loversbrasileiras.com.br'

  // Páginas estáticas
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/produtos', priority: '0.9', changefreq: 'daily' },
    { loc: '/sobre', priority: '0.5', changefreq: 'monthly' },
    { loc: '/retirada', priority: '0.6', changefreq: 'monthly' },
  ]

  // Buscar categorias do banco
  const supabase = serverSupabaseClient(event)
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .order('name')

  // Buscar produtos do banco
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('active', true)
    .order('updated_at', { ascending: false })
    .limit(500) // Limitar para não sobrecarregar

  // Construir XML
  const categoryUrls = (categories ?? []).map((cat: { slug: string; updated_at: string }) => ({
    loc: `/categoria/${cat.slug}`,
    lastmod: new Date(cat.updated_at).toISOString().split('T')[0],
    priority: '0.8',
    changefreq: 'weekly',
  }))

  const productUrls = (products ?? []).map((prod: { slug: string; updated_at: string }) => ({
    loc: `/produtos/${prod.slug}`,
    lastmod: new Date(prod.updated_at).toISOString().split('T')[0],
    priority: '0.7',
    changefreq: 'weekly',
  }))

  const allUrls = [...staticPages, ...categoryUrls, ...productUrls]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
  return sitemap
})
