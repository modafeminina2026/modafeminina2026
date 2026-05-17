<script setup lang="ts">
import { Package, MapPin, Truck, Clock, CheckCircle, XCircle, Gift } from 'lucide-vue-next'
import type { Order } from '~/composables/useOrders'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { fetchOrderById, copyPickupCode } = useOrders()
const { formatPickupCode, formatPickupDate, getPickupStatusLabel, getPickupStatusColor } = usePickup()

const order = ref<Order | null>(null)
const loading = ref(true)

onMounted(async () => {
  order.value = await fetchOrderById(route.params.id as string)
  loading.value = false
})

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  processing: 'Processando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const isPickup = computed(() => order.value?.delivery_method === 'pickup')

useHead({
  title: computed(() => `Pedido ${order.value?.order_number ?? ''} — Lover's Brasileiras`),
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24 md:pb-8">
    <div class="max-w-2xl mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <NuxtLink
          to="/perfil/pedidos"
          class="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Voltar aos pedidos"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <div>
          <h1 class="text-xl font-semibold text-gray-900">Detalhes do Pedido</h1>
          <p v-if="order" class="text-xs text-gray-500">{{ order.order_number }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 4" :key="i" class="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-3" />
          <div class="h-3 bg-gray-200 rounded w-2/3 mb-2" />
          <div class="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      <!-- Pedido não encontrado -->
      <div v-else-if="!order" class="text-center py-16">
        <XCircle class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-gray-600">Pedido não encontrado</p>
        <NuxtLink to="/perfil/pedidos" class="text-rose-500 text-sm mt-2 inline-block">Voltar aos pedidos</NuxtLink>
      </div>

      <!-- Conteúdo do pedido -->
      <div v-else class="space-y-4">
        <!-- Status e data -->
        <div class="bg-white rounded-2xl shadow-sm p-4">
          <div class="flex items-center justify-between mb-2">
            <h2 class="font-semibold text-gray-800">{{ order.order_number }}</h2>
            <span
              class="text-xs font-medium px-2.5 py-1 rounded-full"
              :class="statusColors[order.status] ?? 'bg-gray-100 text-gray-600'"
            >
              {{ statusLabels[order.status] ?? order.status }}
            </span>
          </div>
          <p class="text-xs text-gray-400">{{ formatDate(order.created_at) }}</p>
        </div>

        <!-- Código de retirada em destaque (se pickup) -->
        <div v-if="isPickup && order.pickup_code" class="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-5 text-white">
          <div class="flex items-center gap-2 mb-3">
            <MapPin class="w-5 h-5" />
            <h2 class="font-semibold">Retirada na Loja</h2>
          </div>

          <div class="bg-white/20 rounded-xl p-4 text-center mb-3">
            <p class="text-white/80 text-xs uppercase tracking-wider mb-1">Código de Retirada</p>
            <div class="text-5xl font-mono font-bold tracking-[0.3em] mb-2">
              {{ formatPickupCode(order.pickup_code) }}
            </div>
            <button
              class="bg-white text-rose-500 font-semibold text-sm px-4 py-2 rounded-full min-h-[40px] hover:bg-rose-50 active:scale-[0.97] transition-all"
              @click="copyPickupCode(order.pickup_code!)"
            >
              Copiar Código
            </button>
          </div>

          <div v-if="order.pickup_status" class="flex items-center gap-2">
            <span class="text-xs bg-white/20 px-2 py-1 rounded-full">
              {{ getPickupStatusLabel(order.pickup_status) }}
            </span>
          </div>

          <div v-if="order.pickup_ready_by" class="mt-2 text-white/80 text-xs flex items-center gap-1.5">
            <Clock class="w-3.5 h-3.5" />
            Pronto em: {{ formatPickupDate(order.pickup_ready_by) }}
          </div>
        </div>

        <!-- Endereço de entrega (se shipping) -->
        <div v-else-if="order.shipping_address" class="bg-white rounded-2xl shadow-sm p-4">
          <div class="flex items-center gap-2 mb-3">
            <Truck class="w-4 h-4 text-rose-500" />
            <h2 class="font-semibold text-gray-800">Endereço de Entrega</h2>
          </div>
          <div class="text-sm text-gray-600 space-y-0.5">
            <p>{{ (order.shipping_address as Record<string, string>).street }}, {{ (order.shipping_address as Record<string, string>).number }}</p>
            <p v-if="(order.shipping_address as Record<string, string>).complement">{{ (order.shipping_address as Record<string, string>).complement }}</p>
            <p>{{ (order.shipping_address as Record<string, string>).neighborhood }} — {{ (order.shipping_address as Record<string, string>).city }}/{{ (order.shipping_address as Record<string, string>).state }}</p>
            <p>CEP: {{ (order.shipping_address as Record<string, string>).zip }}</p>
          </div>
        </div>

        <!-- Mensagem de presente -->
        <div v-if="order.gift_message || order.gift_wrap" class="bg-white rounded-2xl shadow-sm p-4">
          <div class="flex items-center gap-2 mb-3">
            <Gift class="w-4 h-4 text-rose-500" />
            <h2 class="font-semibold text-gray-800">Presente</h2>
          </div>
          <div class="space-y-2 text-sm text-gray-600">
            <p v-if="order.gift_wrap" class="flex items-center gap-1.5">
              <CheckCircle class="w-4 h-4 text-green-500" />
              Embalagem para presente incluída
            </p>
            <div v-if="order.gift_message">
              <p class="text-xs text-gray-400 mb-1">Mensagem:</p>
              <p class="italic bg-rose-50 rounded-lg p-3">"{{ order.gift_message }}"</p>
            </div>
          </div>
        </div>

        <!-- Itens do pedido -->
        <div v-if="order.order_items && order.order_items.length > 0" class="bg-white rounded-2xl shadow-sm p-4">
          <h2 class="font-semibold text-gray-800 mb-3">Itens do Pedido</h2>
          <div class="space-y-3">
            <div
              v-for="item in order.order_items"
              :key="item.id"
              class="flex items-center gap-3"
            >
              <img
                v-if="item.products?.images?.[0]"
                :src="item.products.images[0]"
                :alt="item.product_name"
                class="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                loading="lazy"
              >
              <div v-else class="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                <Package class="w-6 h-6 text-gray-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800 text-sm truncate">{{ item.product_name }}</p>
                <p class="text-xs text-gray-500">
                  Qtd: {{ item.quantity }}
                  <span v-if="item.size"> · {{ item.size }}</span>
                  <span v-if="item.color"> · {{ item.color }}</span>
                </p>
              </div>
              <p class="font-semibold text-gray-800 text-sm flex-shrink-0">
                {{ formatPrice(item.unit_price * item.quantity) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Resumo financeiro -->
        <div class="bg-white rounded-2xl shadow-sm p-4">
          <h2 class="font-semibold text-gray-800 mb-3">Resumo</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{{ formatPrice(order.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Frete</span>
              <span :class="order.shipping_cost === 0 ? 'text-green-600 font-medium' : ''">
                {{ order.shipping_cost === 0 ? 'GRÁTIS' : formatPrice(order.shipping_cost) }}
              </span>
            </div>
            <div class="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
