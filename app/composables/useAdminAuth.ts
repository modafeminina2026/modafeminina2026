export interface AdminUser {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator'
  permissions: string[]
  mfa_enabled: boolean
}

export function useAdminAuth() {
  const client = useSupabaseClient()
  const adminUser = useState<AdminUser | null>('admin-user', () => null)
  const loading = ref(false)

  async function login(email: string, password: string): Promise<{ requires_mfa: boolean }> {
    loading.value = true
    try {
      // Sign in via Supabase to get session
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      if (error || !data.session) throw new Error(error?.message ?? 'Falha no login')

      const token = data.session.access_token

      // Verify admin status
      const result = await $fetch<{ user: AdminUser; requires_mfa: boolean }>('/api/admin/auth/login', {
        method: 'POST',
        body: { email, password },
        headers: { Authorization: `Bearer ${token}` },
      })

      adminUser.value = result.user
      return { requires_mfa: result.requires_mfa }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    adminUser.value = null
    await client.auth.signOut()
    await navigateTo('/admin/login')
  }

  async function fetchMe() {
    try {
      const { data: { session } } = await client.auth.getSession()
      if (!session?.access_token) return null

      const data = await $fetch<AdminUser>('/api/admin/auth/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      adminUser.value = data
      return data
    } catch {
      adminUser.value = null
      return null
    }
  }

  function hasPermission(permission: string): boolean {
    if (!adminUser.value) return false
    if (adminUser.value.role === 'super_admin') return true
    if (adminUser.value.permissions.includes('*')) return true
    return adminUser.value.permissions.includes(permission)
  }

  const isAdmin = computed(() => !!adminUser.value)
  const isSuperAdmin = computed(() => adminUser.value?.role === 'super_admin')

  return { adminUser, loading, isAdmin, isSuperAdmin, login, logout, fetchMe, hasPermission }
}
