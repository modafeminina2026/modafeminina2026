<script setup lang="ts">
import { Package, ShoppingBag, MapPin, TrendingUp } from 'lucide-vue-next'

interface Stat {
  label: string
  value: string
  change: number
  icon: unknown
  color: string
}

const props = defineProps<{
  stats?: {
    totalProducts: number
    totalOrders: number
    pendingPickups: number
    revenueThisMonth: number
    revenueLastMonth: number
    ordersLastMonth: number
  }
  loading?: boolean
}>()

const cards = computed((): Stat[] => {
  const s = props.stats
  if (!s) return []

  const revenueChange = s.revenueLastMonth > 0
    ? Math.round(((s.revenueThisMonth - s.revenueLastMonth) / s.revenueLastMonth) * 100)
    : 0

  return [
    {
      label: 'Total de Produtos',
      value: s.totalProducts.toString(),
      change: 0,
      icon: Package,
      color: 'text-blue-400 bg-blue-400/10',
    },
    {
      label: 'Pedidos este Mês',
      value: s.totalOrders.toString(),
      change: 0,
      icon: ShoppingBag,
      color: 'text-purple-400 bg-purple-400/10',
    },
    {
      label: 'Retiradas Pendentes',
      value: s.pendingPickups.toString(),
      change: 0,
      icon: MapPin,
      color: 'text-amber-400 bg-amber-400/10',
    },
    {
      label: 'Receita este Mês',
      value: s.revenueThisMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      change: revenueChange,
      icon: TrendingUp,
      color: 'text-green-400 bg-green-400/10',
    },
  ]
})
</script>

<template>
  <!-- Skeleton -->
  <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div v-for="i in 4" :key="i" class="bg-gray-800 rounded-2xl p-5 animate-pulse">
      <div class="w-10 h-10 bg-gray-700 rounded-xl mb-3" />
      <div class="h-3 bg-gray-700 rounded w-2/3 mb-2" />
      <div class="h-6 bg-gray-700 rounded w-1/2" />
    </div>
  </div>

  <!-- Cards -->
  <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="card in cards"
      :key="card.label"
      class="bg-gray-800 border border-gray-700 rounded-2xl p-5"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="card.color">
          <component :is="card.icon" class="w-5 h-5" />
        </div>
        <span
          v-if="card.change !== 0"
          class="text-xs font-medium px-2 py-0.5 rounded-full"
          :class="card.change > 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'"
        >
          {{ card.change > 0 ? '+' : '' }}{{ card.change }}%
        </span>
      </div>
      <p class="text-xs text-gray-400 mb-1">{{ card.label }}</p>
      <p class="text-xl font-bold text-gray-100">{{ card.value }}</p>
    </div>
  </div>
</template>
