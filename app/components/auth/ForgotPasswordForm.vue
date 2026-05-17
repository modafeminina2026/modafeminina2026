<script setup lang="ts">
import { Mail } from 'lucide-vue-next'

const { forgotPassword, loading } = useAuth()

const email   = ref('')
const error   = ref('')
const sent    = ref(false)

async function submit() {
  error.value = ''
  if (!email.value) { error.value = 'E-mail obrigatório'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { error.value = 'E-mail inválido'; return }
  const ok = await forgotPassword(email.value)
  if (ok) sent.value = true
}
</script>

<template>
  <div>
    <!-- Success state -->
    <div v-if="sent" class="text-center space-y-4">
      <div class="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p class="font-semibold text-gray-900">E-mail enviado!</p>
        <p class="text-sm text-gray-600 mt-1">
          Verifique sua caixa de entrada em <strong>{{ email }}</strong> e siga as instruções para redefinir sua senha.
        </p>
      </div>
      <NuxtLink to="/login" class="inline-flex items-center text-sm text-rose-600 font-medium hover:underline">
        ← Voltar para Login
      </NuxtLink>
    </div>

    <!-- Form -->
    <form v-else class="space-y-4" novalidate @submit.prevent="submit">
      <p class="text-sm text-gray-600">
        Digite seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <AppInput
        v-model="email"
        label="E-mail"
        type="email"
        inputmode="email"
        autocomplete="email"
        placeholder="seu@email.com"
        :icon="Mail"
        :error="error"
        required
      />

      <AppButton type="submit" variant="primary" full-width size="lg" :loading="loading">
        Enviar Link de Recuperação
      </AppButton>

      <div class="text-center">
        <NuxtLink to="/login" class="text-sm text-rose-600 hover:underline">
          ← Voltar para Login
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
