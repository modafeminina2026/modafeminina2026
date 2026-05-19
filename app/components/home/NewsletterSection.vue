<script setup lang="ts">
import { Mail, Heart } from 'lucide-vue-next'

const email     = ref('')
const subscribed = ref(false)
const error     = ref('')

function subscribe() {
  error.value = ''
  if (!email.value) { error.value = 'Digite seu e-mail'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { error.value = 'E-mail inválido'; return }
  subscribed.value = true
  email.value = ''
}
</script>

<template>
  <section
    class="rounded-2xl bg-gradient-to-br from-rose-50 to-purple-50 border border-rose-100 p-6 sm:p-10 text-center"
    aria-label="Newsletter"
  >
    <div class="flex items-center justify-center w-14 h-14 bg-rose-100 rounded-2xl mx-auto mb-4" aria-hidden="true">
      <Mail class="w-7 h-7 text-rose-600" />
    </div>

    <h2 class="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-2">
      Receba Ofertas Exclusivas
    </h2>
    <p class="text-gray-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
      Cadastre seu e-mail e seja a primeira a saber sobre promoções, lançamentos e novidades especiais.
    </p>

    <div v-if="subscribed" class="flex items-center justify-center gap-2 text-green-600 font-medium">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      Inscrito com sucesso! Obrigado
    </div>

    <form v-else class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" novalidate @submit.prevent="subscribe">
      <div class="flex-1">
        <input
          v-model="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          placeholder="seu@email.com"
          class="w-full h-12 px-4 rounded-xl border text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors"
          :class="error ? 'border-red-400' : 'border-gray-300'"
          :aria-invalid="!!error"
          :aria-describedby="error ? 'newsletter-error' : undefined"
        />
        <p v-if="error" id="newsletter-error" class="text-xs text-red-500 mt-1 text-left" role="alert">{{ error }}</p>
      </div>
      <AppButton type="submit" variant="primary" size="lg" class="shrink-0">
        Quero Ofertas
      </AppButton>
    </form>

    <p class="text-xs text-gray-400 mt-3">Sem spam. Cancele quando quiser.</p>
  </section>
</template>
