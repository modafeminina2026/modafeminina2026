import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }

  const client = await serverSupabaseClient(event)

  const { data: product, error } = await client
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error || !product) {
    throw createError({ statusCode: 404, message: 'Produto não encontrado' })
  }

  return product
})
