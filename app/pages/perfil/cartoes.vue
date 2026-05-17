<script setup lang="ts">
import { CreditCard, Plus } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'Cartões Salvos — Lover\'s Brasileiras',
  meta: [{ name: 'description', content: 'Gerencie seus cartões salvos na Lover\'s Brasileiras.' }],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24 md:pb-8">
    <div class="max-w-2xl mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <NuxtLink
          to="/perfil"
          class="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Voltar ao perfil"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <h1 class="text-xl font-semibold text-gray-900">Cartões Salvos</h1>
      </div>

      <!-- Componente de cartões -->
      <SavedCards />

      <!-- Info sobre segurança -->
      <div class="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <div class="flex items-start gap-3">
          <CreditCard class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div class="text-sm text-blue-700">
            <p class="font-medium mb-1">Seus dados estão seguros</p>
            <p class="text-blue-600 text-xs">
              Armazenamos apenas os últimos 4 dígitos do cartão. Os dados completos são processados com segurança pelo Stripe, certificado PCI DSS nível 1.
            </p>
          </div>
        </div>
      </div>

      <!-- Adicionar novo cartão (via checkout) -->
      <div class="mt-4 bg-white rounded-2xl shadow-sm p-4 text-center">
        <p class="text-sm text-gray-500 mb-3">Novos cartões são salvos automaticamente ao finalizar uma compra.</p>
        <NuxtLink
          to="/produtos"
          class="inline-flex items-center gap-2 text-rose-500 font-semibold text-sm hover:text-rose-600 min-h-[44px]"
        >
          <Plus class="w-4 h-4" />
          Fazer uma compra
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
