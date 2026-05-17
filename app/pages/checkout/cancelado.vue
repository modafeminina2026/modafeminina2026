<script setup lang="ts">
import { XCircle, RefreshCw, ShoppingBag } from 'lucide-vue-next'

useHead({
  title: 'Pagamento Cancelado — Lover\'s Brasileiras',
  meta: [{ name: 'description', content: 'Seu pagamento foi cancelado. Tente novamente.' }],
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md text-center">
      <!-- Ícone -->
      <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle class="w-12 h-12 text-red-400" />
      </div>

      <h1 class="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-2">
        Pagamento Cancelado
      </h1>
      <p class="text-gray-600 mb-2">
        Seu pagamento não foi concluído. Nenhuma cobrança foi realizada.
      </p>
      <p class="text-gray-500 text-sm mb-8">
        Seus itens ainda estão no carrinho. Você pode tentar novamente quando quiser. 💕
      </p>

      <!-- Card de ajuda -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-6 text-left">
        <h2 class="font-semibold text-gray-800 mb-3 text-sm">Por que isso pode ter acontecido?</h2>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-start gap-2">
            <span class="text-rose-400 mt-0.5">•</span>
            Você cancelou o pagamento manualmente
          </li>
          <li class="flex items-start gap-2">
            <span class="text-rose-400 mt-0.5">•</span>
            Cartão recusado ou sem limite suficiente
          </li>
          <li class="flex items-start gap-2">
            <span class="text-rose-400 mt-0.5">•</span>
            Sessão de pagamento expirou
          </li>
          <li class="flex items-start gap-2">
            <span class="text-rose-400 mt-0.5">•</span>
            Problema temporário de conexão
          </li>
        </ul>
      </div>

      <!-- Ações -->
      <div class="space-y-3">
        <NuxtLink
          to="/checkout"
          class="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-3 rounded-xl min-h-[48px] flex items-center justify-center gap-2 hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all"
        >
          <RefreshCw class="w-4 h-4" />
          Tentar Novamente
        </NuxtLink>
        <NuxtLink
          to="/carrinho"
          class="w-full bg-white text-rose-500 font-semibold py-3 rounded-xl min-h-[48px] flex items-center justify-center gap-2 border border-rose-200 hover:bg-rose-50 active:scale-[0.97] transition-all"
        >
          <ShoppingBag class="w-4 h-4" />
          Ver Carrinho
        </NuxtLink>
        <NuxtLink
          to="/"
          class="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2 min-h-[44px] flex items-center justify-center"
        >
          Voltar para o Início
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
