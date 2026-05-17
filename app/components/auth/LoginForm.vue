<script setup lang="ts">
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'

const { login, loading } = useAuth()

const email    = ref('')
const password = ref('')
const showPwd  = ref(false)
const errors   = ref({ email: '', password: '' })

function validate() {
  errors.value = { email: '', password: '' }
  if (!email.value) errors.value.email = 'E-mail obrigatório'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) errors.value.email = 'E-mail inválido'
  if (!password.value) errors.value.password = 'Senha obrigatória'
  return !errors.value.email && !errors.value.password
}

async function submit() {
  if (!validate()) return
  const ok = await login(email.value, password.value)
  if (ok) await navigateTo('/')
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="submit">
    <AppInput
      v-model="email"
      label="E-mail"
      type="email"
      inputmode="email"
      autocomplete="email"
      placeholder="seu@email.com"
      :icon="Mail"
      :error="errors.email"
      required
    />

    <div class="flex flex-col gap-1 w-full">
      <label class="text-sm font-medium text-gray-700" for="login-password">
        Senha <span class="text-rose-500 ml-0.5" aria-hidden="true">*</span>
      </label>
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
        <input
          id="login-password"
          v-model="password"
          :type="showPwd ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="Sua senha"
          class="w-full h-12 rounded-lg border bg-white pl-10 pr-12 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0"
          :class="errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-rose-400'"
          :aria-invalid="!!errors.password"
          :aria-describedby="errors.password ? 'login-password-error' : undefined"
        />
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600"
          :aria-label="showPwd ? 'Ocultar senha' : 'Mostrar senha'"
          @click="showPwd = !showPwd"
        >
          <EyeOff v-if="showPwd" class="w-4 h-4" aria-hidden="true" />
          <Eye v-else class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      <p v-if="errors.password" id="login-password-error" class="text-sm text-red-500 mt-0.5" role="alert">
        {{ errors.password }}
      </p>
    </div>

    <div class="flex justify-end">
      <NuxtLink to="/esqueci-senha" class="text-sm text-rose-600 hover:underline">
        Esqueci minha senha
      </NuxtLink>
    </div>

    <AppButton type="submit" variant="primary" full-width size="lg" :loading="loading">
      Entrar
    </AppButton>

    <p class="text-center text-sm text-gray-600">
      Não tem conta?
      <NuxtLink to="/registro" class="text-rose-600 font-medium hover:underline">Criar conta</NuxtLink>
    </p>
  </form>
</template>
