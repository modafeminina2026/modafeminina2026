<script setup lang="ts">
import { Package, ChevronRight, MapPin, Truck, Clock } from 'lucide-vue-next'
import type { Order } from '~/composables/useOrders'

definePageMeta({ middleware: 'auth' })

const { fetchOrders, copyPickupCode } = useOrders()
const { formatPickupCode, getPickupStatusLabel, getPickupStatusColor } = usePickup()

const orders = ref<Order[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const nextCursor = ref<string | null>(null)
const hasMore = computed(() => !!nextCursor.value)

async function loadOrders(cursor?: string) {
  try {
    const result = await fetchOrders(cursor)
    if (cursor) {
      orders.value.push(...result.orders)
    } else {
      orders.value = result.orders
    }
    nextCursor.value = result.nextCursor
  } catch {
    // silently fail
  }
}

async function loadMore() {
  if (!nextCursor.value || loadingMore.value) return
  loadingMore.value = true
  await loadOrders(nextCursor.value)
  loadingMore.value = false
}

onMounted(async () => {
  await loadOrders()
  loading.value = false
})

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
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

useHead({
  title: 'Meus Pedidos — Lover\'s Brasileiras',
  meta: [{ name: 'description', content: 'Acompanhe seus pedidos na Lover\'s Brasileiras.' }],
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
        <h1 class="text-xl font-semibold text-gray-900">Meus Pedidos</h1>
      </div>

      <!-- Loading skeletons -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
          <div class="flex justify-between mb-3">
            <div class="h-4 bg-gray-200 rounded w-24" />
            <div class="h-5 bg-gray-200 rounded-full w-16" />
          </div>
          <div class="h-3 bg-gray-200 rounded w-32 mb-2" />
          <div class="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>

      <!-- Lista vazia -->
      <div v-else-if="orders.length === 0" class="text-center py-16">
        <div class="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package class="w-8 h-8 text-rose-400" />
        </div>
        <h2 class="text-lg font-semibold text-gray-800 mb-2">Nenhum pedido ainda</h2>
        <p class="text-gray-500 text-sm mb-6">Que tal fazer sua primeira compra? 💕</p>
        <NuxtLink
          to="/produtos"
          class="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-full min-h-[48px] inline-flex items-center hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all"
        >
          Ver Produtos
        </NuxtLink>
      </div>

      <!-- Lista de pedidos -->
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="order in orders"
          :key="order.id"
          :to="`/perfil/pedidos/${order.id}`"
          class="block bg-white rounded-2xl shadow-sm p-4 hover:shadow-md active:scale-[0.99] transition-all"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <p class="font-semibold text-gray-800 text-sm">{{ order.order_number }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(order.created_at) }}</p>
            </div>
            <span
              class="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
              :class="statusColors[order.status] ?? 'bg-gray-100 text-gray-600'"
            >
              {{ statusLabels[order.status] ?? order.status }}
            </span>
          </div>

          <!-- Método de entrega -->
          <div class="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <component :is="order.delivery_method === 'pickup' ? MapPin : Truck" class="w-3.5 h-3.5" />
            <span>{{ order.delivery_method === 'pickup' ? 'Retirada na loja' : 'Entrega em domicílio' }}</span>
          </div>

          <!-- Código de retirada (se pickup) -->
          <div v-if="order.delivery_method === 'pickup' && order.pickup_code" class="mb-2">
            <div class="flex items-center gap-2">
              <div class="bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <span class="text-xs text-gray-500">Código:</span>
                <span class="font-mono font-bold text-rose-600 text-base tracking-widest">
                  {{ formatPickupCode(order.pickup_code) }}
                </span>
              </div>
              <button
                class="p-2 text-rose-500 hover:text-rose-600 active:text-rose-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Copiar código"
                @click.prevent="copyPickupCode(order.pickup_code!)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div v-if="order.pickup_status" class="mt-1">
              <span class="text-xs px-2 py-0.5 rounded-full" :class="getPickupStatusColor(order.pickup_status)">
                {{ getPickupStatusLabel(order.pickup_status) }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="font-bold text-gray-900">{{ formatPrice(order.total) }}</span>
            <ChevronRight class="w-4 h-4 text-gray-400" />
          </div>
        </NuxtLink>

        <!-- Carregar mais -->
        <button
          v-if="hasMore"
          class="w-full bg-white text-rose-500 font-semibold py-3 rounded-2xl min-h-[48px] flex items-center justify-center shadow-sm hover:bg-rose-50 active:scale-[0.97] transition-all disabled:opacity-60"
          :disabled="loadingMore"
          @click="loadMore"
        >
          {{ loadingMore ? 'Carregando...' : 'Carregar Mais' }}
        </button>
      </div>
    </div>
  </div>
</template>
