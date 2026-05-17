/**
 * Admin fetch helper — reads token from Supabase client session.
 * Always runs client-side only (no SSR).
 */
export function useAdminFetch() {
  const supabase = useSupabaseClient()

  async function getToken(): Promise<string | null> {
    if (import.meta.server) return null
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }

  async function apiFetch<T>(url: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const token = await getToken()
    return $fetch<T>(url, {
      ...options,
      headers: {
        ...(options.headers as Record<string, string> ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }

  return { apiFetch, getToken }
}
