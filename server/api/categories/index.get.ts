import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Use service role to ensure categories are always accessible
  const client = createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceRoleKey as string,
  )

  const { data, error } = await client
    .from('categories')
    .select('id, name, slug, description, image_url, display_order')
    .order('display_order', { ascending: true })

  if (error) throw createError({ statusCode: 500, message: 'Erro ao buscar categorias' })

  return data ?? []
})
