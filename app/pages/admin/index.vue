<script setup lang="ts">
import { AlertTriangle, MapPin, RefreshCw } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { apiFetch } = useAdminFetch()

const stats = ref<Record<string, unknown> | null>(null)
const chartData = ref<{ date: string; revenue: number; orders: number }[]>([])
const pending = ref(false)

async function loadData() {
  pending.value = true
  try {
    const [s, c] = await Promise.all([
      apiFetch<Record<string, unknown>>('/api/admin/stats/overview'),
      apiFetch<{ date: string; revenue: number; orders: number }[]>('/api/admin/stats/sales-chart'),
    ])
    stats.value = s
    chartData.value = c
  } catch { /* silently fail */ }
  finally { pending.value = false }
}

onMounted(loadData)

const s = computed(() => stats.value)

function formatPrice(v: unknown) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(d: unknown) {
  return new Date(d as string).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente', paid: 'Pago', preparing: 'Preparando',
  ready_for_pickup: 'Pronto', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
}
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400', paid: 'bg-blue-400/10 text-blue-400',
  preparing: 'bg-purple-400/10 text-purple-400', ready_for_pickup: 'bg-green-400/10 text-green-400',
  shipped: 'bg-indigo-400/10 text-indigo-400', delivered: 'bg-emerald-400/10 text-emerald-400',
  cancelled: 'bg-red-400/10 text-red-400',
}

const maxRevenue = computed(() => Math.max(...chartData.value.map((d) => d.revenue), 1))

useHead({ title: 'Dashboard — Admin' })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-100">Dashboard</h1>
        <p class="text-sm text-gray-400 mt-0.5">Visão geral da loja</p>
      </div>
      <button class="p-2 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors" @click="loadData">
        <RefreshCw class="w-4 h-4" :class="pending ? 'animate-spin' : ''" />
      </button>
    </div>

    <AdminStats :stats="s as never" :loading="pending" class="mb-6" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Sales chart -->
      <div class="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-2xl p-5">
        <h2 class="font-semibold text-gray-200 mb-4">Vendas — Últimos 30 dias</h2>
        <div v-if="chartData.length" class="flex items-end gap-0.5 h-32">
          <div v-for="day in chartData" :key="day.date" class="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              class="w-full bg-rose-500/60 hover:bg-rose-500 rounded-sm transition-all cursor-pointer"
              :style="{ height: `${Math.max((day.revenue / maxRevenue) * 100, day.revenue > 0 ? 4 : 0)}%` }"
            />
            <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {{ day.date.slice(5) }}: {{ formatPrice(day.revenue) }}
            </div>
          </div>
        </div>
        <div v-else class="h-32 flex items-center justify-center text-gray-500 text-sm">
          {{ pending ? 'Carregando...' : 'Sem dados' }}
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-2">
          <span>{{ chartData[0]?.date?.slice(5) }}</span>
          <span>Hoje</span>
        </div>
      </div>

      <!-- Ready for pickup -->
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-4">
          <MapPin class="w-4 h-4 text-purple-400" />
          <h2 class="font-semibold text-gray-200">Prontos p/ Retirada</h2>
          <span v-if="(s?.readyPickups as unknown[])?.length" class="ml-auto text-xs bg-purple-400/10 text-purple-400 px-2 py-0.5 rounded-full font-medium">
            {{ (s?.readyPickups as unknown[]).length }}
          </span>
        </div>
        <div v-if="!(s?.readyPickups as unknown[])?.length" class="text-sm text-gray-500 text-center py-4">
          Nenhum pedido aguardando retirada
        </div>
        <div v-else class="space-y-2">
          <NuxtLink
            v-for="order in (s?.readyPickups as Record<string, unknown>[])"
            :key="order.id as string"
            :to="`/admin/pedidos/${order.id}`"
            class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <div class="font-mono text-lg font-bold text-purple-300">{{ order.pickup_code }}</div>
            <div class="min-w-0">
              <p class="text-xs text-gray-300 truncate">{{ order.guest_name ?? '—' }}</p>
              <p class="text-xs text-gray-500">{{ order.order_number }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent orders -->
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-200">Pedidos Recentes</h2>
          <NuxtLink to="/admin/pedidos" class="text-xs text-rose-400 hover:text-rose-300">Ver todos →</NuxtLink>
        </div>
        <div v-if="!(s?.recentOrders as unknown[])?.length" class="text-sm text-gray-500 text-center py-4">
          {{ pending ? 'Carregando...' : 'Nenhum pedido' }}
        </div>
        <div v-else class="space-y-2">
          <NuxtLink
            v-for="order in (s?.recentOrders as Record<string, unknown>[])"
            :key="order.id as string"
            :to="`/admin/pedidos/${order.id}`"
            class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <p class="text-xs font-mono text-gray-300">{{ order.order_number ?? (order.id as string).slice(0, 8) }}</p>
              <p class="text-xs text-gray-500 truncate">{{ (order.guest_name as string) ?? '—' }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0" :class="statusColors[order.status as string] ?? 'bg-gray-600/50 text-gray-400'">
              {{ statusLabels[order.status as string] ?? order.status }}
            </span>
            <span class="text-xs text-gray-300 flex-shrink-0">{{ formatPrice(order.total) }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Low stock -->
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-amber-400" />
            <h2 class="font-semibold text-gray-200">Estoque Baixo</h2>
          </div>
          <NuxtLink to="/admin/produtos" class="text-xs text-rose-400 hover:text-rose-300">Ver todos →</NuxtLink>
        </div>
        <div v-if="!(s?.lowStock as unknown[])?.length" class="text-sm text-gray-500 text-center py-4">
          {{ pending ? 'Carregando...' : 'Nenhum produto com estoque baixo 🎉' }}
        </div>
        <div v-else class="space-y-2">
          <NuxtLink
            v-for="product in (s?.lowStock as Record<string, unknown>[])"
            :key="product.id as string"
            :to="`/admin/produtos/${product.id}`"
            class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <img v-if="(product.images as string[])?.[0]" :src="(product.images as string[])[0]" :alt="product.name as string" class="w-8 h-8 object-cover rounded-lg flex-shrink-0" loading="lazy" />
            <div v-else class="w-8 h-8 bg-gray-700 rounded-lg flex-shrink-0" />
            <p class="flex-1 text-xs text-gray-300 truncate">{{ product.name }}</p>
            <span class="text-xs font-bold flex-shrink-0" :class="Number(product.stock) === 0 ? 'text-red-400' : 'text-amber-400'">
              {{ product.stock }} un.
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
