import { requireAdmin, getAdminClient } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const db = getAdminClient()

  const { data, error } = await db
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('id', id)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })
  return data
})
