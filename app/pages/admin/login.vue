<script setup lang="ts">
import { LogIn, Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({ layout: false })

const { login, loading } = useAdminAuth()
const router = useRouter()
const { playSuccess, playError } = useSound()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMsg.value = 'Preencha email e senha'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const result = await login(email.value, password.value)
    if (!result.requires_mfa) {
      playSuccess()
      await router.push('/admin')
    }
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    errorMsg.value = e?.data?.message ?? e?.message ?? 'Credenciais inválidas'
    playError()
  } finally {
    loading.value = false
  }
}

useHead({ title: 'Admin Login — Lover\'s Brasileiras' })
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-display font-bold bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
          Lover's Admin
        </h1>
        <p class="text-gray-500 text-sm mt-1">Painel Administrativo</p>
      </div>

      <!-- Card -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <!-- Error message -->
        <div v-if="errorMsg" class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {{ errorMsg }}
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-sm text-gray-400 mb-1">E-mail</label>
            <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="admin@loversbrasileiras.com"
              class="w-full h-12 px-4 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-gray-600"
            >
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Senha</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full h-12 px-4 pr-12 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-gray-600"
              >
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl min-h-[48px] transition-all disabled:opacity-60 active:scale-[0.97]"
          >
            <LogIn class="w-4 h-4" />
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-gray-600 mt-4">
        <NuxtLink to="/" class="hover:text-gray-400 transition-colors">← Voltar ao site</NuxtLink>
      </p>
    </div>
  </div>
</template>
