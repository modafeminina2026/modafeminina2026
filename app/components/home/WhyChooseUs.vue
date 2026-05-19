<script setup lang="ts">
import { Gift, Store, Lock, Heart } from 'lucide-vue-next'

const benefits = [
  {
    icon: Gift,
    color: 'text-rose-500 bg-rose-50',
    title: 'Embalagem de Presente',
    description: 'Todos os pedidos podem ser embalados com carinho, sem custo adicional.',
  },
  {
    icon: Store,
    color: 'text-purple-500 bg-purple-50',
    title: 'Retire em 3 Dias',
    description: 'Escolha retirada na loja e receba seu código exclusivo após o pagamento.',
  },
  {
    icon: Lock,
    color: 'text-blue-500 bg-blue-50',
    title: 'Pagamento Seguro',
    description: 'Transações protegidas pelo Stripe com criptografia de ponta a ponta.',
  },
  {
    icon: Heart,
    color: 'text-pink-500 bg-pink-50',
    title: 'Satisfação Garantida',
    description: 'Produtos selecionados com qualidade premium para momentos especiais.',
  },
]
</script>

<template>
  <section aria-label="Por que nos escolher">
    <h2 class="text-xl sm:text-2xl font-display font-bold text-gray-900 text-center mb-6 sm:mb-8">
      Por Que Escolher a Lover's?
    </h2>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      <div
        v-for="benefit in benefits"
        :key="benefit.title"
        class="flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-rose-100 transition-all"
      >
        <div class="w-12 h-12 rounded-full flex items-center justify-center mb-3" :class="benefit.color">
          <component :is="benefit.icon" class="w-6 h-6" />
        </div>
        <h3 class="font-semibold text-gray-900 text-sm sm:text-base mb-1 leading-snug">{{ benefit.title }}</h3>
        <p class="text-xs sm:text-sm text-gray-500 leading-relaxed">{{ benefit.description }}</p>
      </div>
    </div>
  </section>
</template>
