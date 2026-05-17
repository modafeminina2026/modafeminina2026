<script setup lang="ts">
import { MapPin, Clock, ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section
    class="rounded-2xl border-2 border-rose-100 bg-rose-50 p-6 sm:p-8"
    aria-label="Retirada na loja"
  >
    <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
      <!-- Icon -->
      <div class="flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-100 shrink-0" aria-hidden="true">
        <MapPin class="w-8 h-8 text-rose-600" />
      </div>

      <!-- Content -->
      <div class="flex-1">
        <h2 class="text-xl sm:text-2xl font-display font-bold text-rose-900">
          Retire Grátis na Nossa Loja 🏪
        </h2>
        <p class="text-rose-700 text-sm sm:text-base mt-1">
          Sem frete! Disponível em até 3 dias úteis após o pagamento.
        </p>

        <div class="flex flex-wrap gap-4 mt-3 text-sm text-rose-800">
          <span class="flex items-center gap-1.5">
            <MapPin class="w-4 h-4 text-rose-500" aria-hidden="true" />
            Rua das Flores, 123 — Centro, SP
          </span>
          <span class="flex items-center gap-1.5">
            <Clock class="w-4 h-4 text-rose-500" aria-hidden="true" />
            Seg–Sex 9h–18h · Sáb 9h–13h
          </span>
        </div>

        <!-- Steps -->
        <div class="flex flex-col sm:flex-row gap-3 mt-4">
          <div v-for="(step, i) in ['Escolha seus produtos', 'Receba seu código de 4 dígitos', 'Retire na loja']" :key="i"
            class="flex items-center gap-2 text-xs text-rose-700">
            <span class="flex items-center justify-center w-5 h-5 rounded-full bg-rose-600 text-white font-bold shrink-0 text-[10px]">
              {{ i + 1 }}
            </span>
            {{ step }}
            <span v-if="i < 2" class="hidden sm:block text-rose-300">→</span>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <NuxtLink to="/produtos" class="shrink-0 w-full md:w-auto">
        <AppButton variant="primary" full-width :icon-right="ArrowRight">
          Comprar para Retirada
        </AppButton>
      </NuxtLink>
    </div>
  </section>
</template>
