import { getAdminClient, logAdminAction } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  // The client already signed in via Supabase — we just verify admin status
  // Token comes in Authorization header
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Token obrigatório' })
  }

  const token = authHeader.slice(7)
  const db = getAdminClient()

  // Verify token and get user
  const { data: { user }, error: userError } = await db.auth.getUser(token)
  if (userError || !user) {
    throw createError({ statusCode: 401, message: 'Token inválido' })
  }

  // Check admin status
  const { data: admin, error: adminError } = await db
    .from('admin_users')
    .select('id, user_id, role, permissions, is_active, mfa_enabled')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (adminError || !admin) {
    throw createError({ statusCode: 403, message: 'Acesso negado — não é administrador' })
  }

  // Update last_login_at
  await db.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', admin.id)

  // Log login
  await logAdminAction({ adminId: admin.id, action: 'login', resourceType: 'session', event })

  return {
    user: {
      id: admin.id,
      email: user.email,
      role: admin.role,
      permissions: admin.permissions,
      mfa_enabled: admin.mfa_enabled,
    },
    requires_mfa: admin.mfa_enabled,
  }
})
