export interface RegisterData {
  fullName: string
  email: string
  phone: string
  cpf: string
  password: string
}

export interface ProfileUpdate {
  full_name?: string
  phone?: string
  cpf?: string
  default_address?: Record<string, unknown>
}

export function useAuth() {
  const client  = useSupabaseClient()
  const user    = useSupabaseUser()
  const { error: toastError, success } = useToast()

  const loading = ref(false)

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    try {
      const { error } = await client.auth.signInWithPassword({ email, password })
      if (error) { toastError(error.message); return false }
      success('Bem-vinda de volta! 💕')
      return true
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterData): Promise<boolean> {
    loading.value = true
    try {
      const { data: authData, error } = await client.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.fullName } },
      })
      if (error) { toastError(error.message); return false }

      if (authData.user) {
        await client.from('profiles').upsert({
          id: authData.user.id,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          cpf: data.cpf,
        })
      }
      success('Conta criada com sucesso! 🎉')
      return true
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await client.auth.signOut()
    await navigateTo('/')
  }

  async function forgotPassword(email: string): Promise<boolean> {
    loading.value = true
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/perfil/redefinir-senha`,
      })
      if (error) { toastError(error.message); return false }
      success('Link de recuperação enviado para seu e-mail!')
      return true
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!user.value) return null
    const { data } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    return data
  }

  async function updateProfile(updates: ProfileUpdate): Promise<boolean> {
    if (!user.value) return false
    loading.value = true
    try {
      const { error } = await client
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)
      if (error) { toastError('Erro ao atualizar perfil'); return false }
      success('Perfil atualizado!')
      return true
    } finally {
      loading.value = false
    }
  }

  const isLoggedIn = computed(() => !!user.value)

  return {
    user,
    isLoggedIn,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    fetchProfile,
    updateProfile,
  }
}
