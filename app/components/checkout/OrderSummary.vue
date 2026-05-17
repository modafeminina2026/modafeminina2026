<script setup lang="ts">
import { ChevronDown, ChevronUp, Gift, MapPin, Truck } from 'lucide-vue-next'

const { cart, subtotal, shippingCost, total } = useCart()

const expanded = ref(false)
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <!-- Mobile toggle header -->
    <button
      class="w-full flex items-center justify-between px-4 py-3 md:hidden"
      :aria-expanded="expanded"
      aria-controls="order-summary-details"
      @click="expanded = !expanded"
    >
      <span class="font-semibold text-gray-900 text-sm">Resumo do Pedido</span>
      <div class="flex items-center gap-2">
        <span class="font-bold text-rose-600">R$ {{ total.toFixed(2).replace('.', ',') }}</span>
        <ChevronDown v-if="!expanded" class="w-4 h-4 text-gray-400" aria-hidden="true" />
        <ChevronUp v-else class="w-4 h-4 text-gray-400" aria-hidden="true" />
      </div>
    </button>

    <!-- Details -->
    <div
      id="order-summary-details"
      class="md:block"
      :class="expanded ? 'block' : 'hidden'"
    >
      <!-- Desktop header -->
      <div class="hidden md:block px-4 pt-4 pb-2">
        <h3 class="font-semibold text-gray-900">Resumo do Pedido</h3>
      </div>

      <!-- Items -->
      <div class="px-4 divide-y divide-gray-50 max-h-64 overflow-y-auto">
        <div
          v-for="item in cart.items"
          :key="item.id"
          class="flex items-center gap-3 py-3"
        >
          <div class="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-50">
            <img :src="item.image || 'https://picsum.photos/60/60?grayscale'" :alt="item.name" loading="lazy" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-800 line-clamp-1">{{ item.name }}</p>
            <p class="text-xs text-gray-500">
              {{ [item.size, item.color].filter(Boolean).join(' · ') || `Qtd: ${item.quantity}` }}
            </p>
          </div>
          <p class="text-sm font-medium text-gray-800 shrink-0">
            R$ {{ (item.price * item.quantity).toFixed(2).replace('.', ',') }}
          </p>
        </div>
      </div>

      <!-- Totals -->
      <div class="px-4 py-3 border-t border-gray-100 space-y-2">
        <div class="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>R$ {{ subtotal.toFixed(2).replace('.', ',') }}</span>
        </div>

        <div class="flex justify-between text-sm">
          <span class="flex items-center gap-1.5 text-gray-600">
            <component :is="cart.deliveryMethod === 'pickup' ? MapPin : Truck" class="w-3.5 h-3.5" aria-hidden="true" />
            {{ cart.deliveryMethod === 'pickup' ? 'Retirada na Loja' : 'Frete' }}
          </span>
          <span :class="shippingCost === 0 ? 'text-green-600 font-medium' : 'text-gray-600'">
            {{ shippingCost === 0 ? 'GRÁTIS' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}` }}
          </span>
        </div>

        <div v-if="cart.items.some(i => i)" class="flex justify-between text-sm text-gray-600">
          <span class="flex items-center gap-1.5">
            <Gift class="w-3.5 h-3.5" aria-hidden="true" />
            Embalagem de presente
          </span>
          <span class="text-green-600 font-medium">GRÁTIS</span>
        </div>

        <div class="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
          <span class="text-gray-900">Total</span>
          <span class="text-rose-600">R$ {{ total.toFixed(2).replace('.', ',') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
