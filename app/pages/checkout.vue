<script setup lang="ts">
import { ArrowLeft, ShoppingBag } from 'lucide-vue-next'

definePageMeta({ middleware: [] }) // Checkout disponível para convidados

const { cart, cartCount, subtotal, shippingCost, total } = useCart()
const router = useRouter()

const isEmpty = computed(() => cart.value.items.length === 0)

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Redirect if cart is empty
onMounted(() => {
  if (isEmpty.value) {
    router.replace('/carrinho')
  }
})

useHead({
  title: 'Checkout — Lover\'s Brasileiras',
  meta: [{ name: 'description', content: 'Finalize seu pedido na Lover\'s Brasileiras.' }],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        <button
          class="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Voltar ao carrinho"
          @click="router.back()"
        >
          <ArrowLeft class="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 class="text-lg font-semibold text-gray-900">Finalizar Compra</h1>
          <p class="text-xs text-gray-500">{{ cartCount }} {{ cartCount === 1 ? 'item' : 'itens' }}</p>
        </div>
        <!-- Logo pequeno -->
        <NuxtLink to="/" class="ml-auto">
          <span class="text-sm font-display font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
            Lover's
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- Carrinho vazio (fallback) -->
    <div v-if="isEmpty" class="flex flex-col items-center justify-center py-20 px-4 text-center">
      <ShoppingBag class="w-16 h-16 text-rose-300 mb-4" />
      <p class="text-gray-600 mb-4">Seu carrinho está vazio</p>
      <NuxtLink to="/produtos" class="text-rose-500 font-semibold">Ver Produtos</NuxtLink>
    </div>

    <!-- Layout checkout -->
    <div v-else class="max-w-5xl mx-auto px-4 py-4 pb-8">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Formulário principal -->
        <div class="flex-1 min-w-0">
          <CheckoutForm />
        </div>

        <!-- Resumo lateral (desktop) -->
        <div class="lg:w-80 lg:flex-shrink-0 hidden lg:block">
          <div class="sticky top-20">
            <OrderSummary :items="cart.items" :subtotal="subtotal" :shipping-cost="shippingCost" :total="total" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
