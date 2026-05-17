export default defineNuxtRouteMiddleware(async (to) => {
  // Skip login page
  if (to.path === '/admin/login') return

  const user = useSupabaseUser()

  // Not authenticated at all → redirect to admin login
  if (!user.value) {
    return navigateTo('/admin/login')
  }

  // User is authenticated — let the page load.
  // The server middleware (admin-auth.ts) will block /api/admin/* if not admin.
  // The /me check happens client-side after mount if needed.
})
