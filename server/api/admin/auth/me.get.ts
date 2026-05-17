import { serverSupabaseUser } from '#supabase/server'
import { getAdminClient } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event).catch(() => null)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  const db = getAdminClient()
  const { data: admin, error } = await db
    .from('admin_users')
    .select('id, role, permissions, is_active, mfa_enabled')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (error || !admin) {
    throw createError({ statusCode: 403, message: 'Não é administrador' })
  }

  return {
    id: admin.id,
    email: user.email,
    role: admin.role,
    permissions: admin.permissions,
    mfa_enabled: admin.mfa_enabled,
  }
})
