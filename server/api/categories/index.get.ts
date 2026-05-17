import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('categories')
    .select('id, name, slug, description, image_url, display_order')
    .order('display_order', { ascending: true })

  if (error) throw createError({ statusCode: 500, message: 'Erro ao buscar categorias' })

  return data ?? []
})
