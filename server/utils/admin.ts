import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export interface AdminUser {
  id: string
  user_id: string
  role: 'super_admin' | 'admin' | 'moderator'
  permissions: string[]
  is_active: boolean
  last_login_at: string | null
  mfa_enabled: boolean
}

export function getAdminClient() {
  const config = useRuntimeConfig()
  return createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceRoleKey as string,
  )
}

/**
 * Verifies that the authenticated user is an active admin.
 * Supports both cookie-based sessions (SSR) and Bearer token (API calls).
 */
export async function requireAdmin(event: Parameters<typeof serverSupabaseUser>[0]): Promise<AdminUser> {
  let userId: string | null = null

  // Try 1: Bearer token in Authorization header
  const authHeader = getRequestHeader(event, 'authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const db = getAdminClient()
    const { data: { user }, error } = await db.auth.getUser(token)
    if (!error && user) {
      userId = user.id
    }
  }

  // Try 2: Cookie-based session (Supabase module)
  if (!userId) {
    const user = await serverSupabaseUser(event).catch(() => null)
    if (user) userId = user.id
  }

  if (!userId) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  const db = getAdminClient()
  const { data: admin, error } = await db
    .from('admin_users')
    .select('id, user_id, role, permissions, is_active, last_login_at, mfa_enabled')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error || !admin) {
    throw createError({ statusCode: 403, message: 'Acesso negado — não é administrador' })
  }

  return admin as AdminUser
}

export function hasPermission(admin: AdminUser, permission: string): boolean {
  if (admin.role === 'super_admin') return true
  if (admin.permissions.includes('*')) return true
  return admin.permissions.includes(permission)
}

export async function logAdminAction(params: {
  adminId: string
  action: string
  resourceType: string
  resourceId?: string
  changes?: { before?: unknown; after?: unknown }
  event?: Parameters<typeof serverSupabaseUser>[0]
}) {
  try {
    const db = getAdminClient()
    const ip = params.event ? getRequestHeader(params.event, 'x-forwarded-for') ?? null : null
    const ua = params.event ? getRequestHeader(params.event, 'user-agent') ?? null : null

    await db.from('activity_logs').insert({
      admin_user_id: params.adminId,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId ?? null,
      changes: params.changes ?? null,
      ip_address: ip,
      user_agent: ua,
    })
  } catch {
    // Log errors never break main flow
  }
}
