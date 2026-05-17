import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }

  const client = await serverSupabaseClient(event)

  const { data: category, error } = await client
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !category) {
    throw createError({ statusCode: 404, message: 'Categoria não encontrada' })
  }

  return category
})
