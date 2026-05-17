<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section
    class="rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 to-rose-600 p-6 sm:p-8"
    aria-label="Promoção"
  >
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-center sm:text-left">
        <AppBadge variant="rose" size="sm" class="mb-2 bg-white/20 text-white border-white/30">
          Oferta Especial
        </AppBadge>
        <h2 class="text-xl sm:text-2xl font-display font-bold text-white">
          Retire na Loja — Frete Grátis! 🎉
        </h2>
        <p class="text-purple-100 text-sm sm:text-base mt-1">
          Escolha retirada na loja e economize no frete. Disponível em até 3 dias úteis.
        </p>
      </div>
      <NuxtLink to="/retirada" class="shrink-0">
        <AppButton variant="outline" size="lg" :icon-right="ArrowRight" class="border-white text-white hover:bg-white/10 whitespace-nowrap">
          Saiba Mais
        </AppButton>
      </NuxtLink>
    </div>
  </section>
</template>
