<script setup lang="ts">
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-vue-next'

const { cart, cartCount, subtotal, shippingCost, total, removeFromCart, updateQuantity, clearCart, setDeliveryMethod } = useCart()
const router = useRouter()

const isEmpty = computed(() => cart.value.items.length === 0)

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

useHead({
  title: 'Carrinho — Lover\'s Brasileiras',
  meta: [{ name: 'description', content: 'Seu carrinho de compras na Lover\'s Brasileiras.' }],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header da página -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
        <button
          class="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Voltar"
          @click="router.back()"
        >
          <ArrowLeft class="w-5 h-5 text-gray-600" />
        </button>
        <h1 class="text-lg font-semibold text-gray-900">
          Carrinho
          <span v-if="cartCount > 0" class="text-sm font-normal text-gray-500 ml-1">({{ cartCount }} {{ cartCount === 1 ? 'item' : 'itens' }})</span>
        </h1>
        <button
          v-if="!isEmpty"
          class="ml-auto text-sm text-red-500 hover:text-red-600 active:text-red-700 transition-colors min-h-[44px] flex items-center gap-1 px-2"
          @click="clearCart()"
        >
          <Trash2 class="w-4 h-4" />
          Limpar
        </button>
      </div>
    </div>

    <!-- Carrinho vazio -->
    <div v-if="isEmpty" class="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div class="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4">
        <ShoppingBag class="w-10 h-10 text-rose-400" />
      </div>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Seu carrinho está vazio</h2>
      <p class="text-gray-500 mb-6 max-w-xs">Que tal explorar nossos produtos e encontrar o presente perfeito? 💕</p>
      <NuxtLink
        to="/produtos"
        class="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold px-8 py-3 rounded-full min-h-[48px] flex items-center hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all"
      >
        Ver Produtos
      </NuxtLink>
    </div>

    <!-- Conteúdo do carrinho -->
    <div v-else class="max-w-4xl mx-auto px-4 py-4 pb-32 md:pb-8">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Lista de itens -->
        <div class="flex-1 space-y-3">
          <CartItem
            v-for="item in cart.items"
            :key="item.id"
            :item="item"
            @update-quantity="(qty) => updateQuantity(item.id, qty)"
            @remove="removeFromCart(item.id)"
          />
        </div>

        <!-- Resumo lateral (desktop) / sticky bottom (mobile) -->
        <div class="lg:w-80 lg:flex-shrink-0">
          <!-- Método de entrega -->
          <div class="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <h3 class="font-semibold text-gray-800 mb-3">Forma de Entrega</h3>
            <DeliveryMethodSelector
              :model-value="cart.deliveryMethod"
              @update:model-value="setDeliveryMethod"
            />
          </div>

          <!-- Resumo de valores -->
          <div class="bg-white rounded-2xl p-4 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-3">Resumo do Pedido</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{{ formatPrice(subtotal) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Frete</span>
                <span :class="shippingCost === 0 ? 'text-green-600 font-medium' : ''">
                  {{ shippingCost === 0 ? 'GRÁTIS' : formatPrice(shippingCost) }}
                </span>
              </div>
              <div class="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{{ formatPrice(total) }}</span>
              </div>
            </div>

            <!-- Botão finalizar (desktop) -->
            <NuxtLink
              to="/checkout"
              class="mt-4 w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-3 rounded-xl min-h-[48px] flex items-center justify-center hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all text-center"
            >
              Finalizar Compra
            </NuxtLink>
            <NuxtLink
              to="/produtos"
              class="mt-2 w-full text-center text-sm text-rose-500 hover:text-rose-600 py-2 min-h-[44px] flex items-center justify-center"
            >
              Continuar Comprando
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra sticky mobile -->
    <div v-if="!isEmpty" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe lg:hidden z-20 shadow-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-600">Total</span>
        <span class="font-bold text-gray-900 text-lg">{{ formatPrice(total) }}</span>
      </div>
      <NuxtLink
        to="/checkout"
        class="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 rounded-xl min-h-[48px] flex items-center justify-center active:scale-[0.97] transition-all text-center"
      >
        Finalizar Compra
      </NuxtLink>
    </div>
  </div>
</template>
