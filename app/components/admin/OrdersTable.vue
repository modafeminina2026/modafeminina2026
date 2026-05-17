<script setup lang="ts">
import { Eye, MapPin, Truck } from 'lucide-vue-next'

interface Order {
  id: string
  order_number: string | null
  status: string
  total: number
  delivery_method: 'shipping' | 'pickup'
  pickup_code: string | null
  pickup_status: string | null
  guest_name: string | null
  guest_email: string | null
  created_at: string
  profiles?: { full_name: string | null; email: string | null } | null
}

defineProps<{ orders: Order[]; loading?: boolean }>()
defineEmits<{ view: [id: string] }>()

const statusLabels: Record<string, string> = {
  pending: 'Pendente', paid: 'Pago', preparing: 'Preparando',
  ready_for_pickup: 'Pronto p/ Retirada', shipped: 'Enviado',
  delivered: 'Entregue', cancelled: 'Cancelado',
}
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400',
  paid: 'bg-blue-400/10 text-blue-400',
  preparing: 'bg-purple-400/10 text-purple-400',
  ready_for_pickup: 'bg-green-400/10 text-green-400',
  shipped: 'bg-indigo-400/10 text-indigo-400',
  delivered: 'bg-emerald-400/10 text-emerald-400',
  cancelled: 'bg-red-400/10 text-red-400',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatPrice(v: number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function customerName(order: Order) {
  return order.guest_name ?? order.profiles?.full_name ?? '—'
}
function customerEmail(order: Order) {
  return order.guest_email ?? order.profiles?.email ?? '—'
}
</script>

<template>
  <div class="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
    <div v-if="loading" class="p-8 text-center text-gray-400">
      <div class="w-8 h-8 border-2 border-gray-600 border-t-rose-400 rounded-full animate-spin mx-auto mb-2" />
      Carregando pedidos...
    </div>
    <div v-else-if="orders.length === 0" class="p-12 text-center text-gray-400 text-sm">
      Nenhum pedido encontrado
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wide">
            <th class="px-4 py-3 text-left">Pedido</th>
            <th class="px-4 py-3 text-left">Cliente</th>
            <th class="px-4 py-3 text-left">Data</th>
            <th class="px-4 py-3 text-right">Total</th>
            <th class="px-4 py-3 text-center">Entrega</th>
            <th class="px-4 py-3 text-center">Status</th>
            <th class="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700/50">
          <tr
            v-for="order in orders"
            :key="order.id"
            class="hover:bg-gray-700/30 transition-colors cursor-pointer"
            :class="order.delivery_method === 'pickup' ? 'bg-purple-900/10' : ''"
            @click="$emit('view', order.id)"
          >
            <td class="px-4 py-3">
              <p class="font-mono text-gray-200 text-xs">{{ order.order_number ?? order.id.slice(0, 8) }}</p>
              <p v-if="order.pickup_code" class="text-xs text-purple-400 font-mono mt-0.5">🔑 {{ order.pickup_code }}</p>
            </td>
            <td class="px-4 py-3">
              <p class="text-gray-200 truncate max-w-[160px]">{{ customerName(order) }}</p>
              <p class="text-xs text-gray-500 truncate max-w-[160px]">{{ customerEmail(order) }}</p>
            </td>
            <td class="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{{ formatDate(order.created_at) }}</td>
            <td class="px-4 py-3 text-right font-medium text-gray-200">{{ formatPrice(order.total) }}</td>
            <td class="px-4 py-3 text-center">
              <span class="inline-flex items-center gap-1 text-xs">
                <component :is="order.delivery_method === 'pickup' ? MapPin : Truck" class="w-3.5 h-3.5" :class="order.delivery_method === 'pickup' ? 'text-purple-400' : 'text-blue-400'" />
                <span :class="order.delivery_method === 'pickup' ? 'text-purple-400' : 'text-blue-400'">
                  {{ order.delivery_method === 'pickup' ? 'Retirada' : 'Entrega' }}
                </span>
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="statusColors[order.status] ?? 'bg-gray-600/50 text-gray-400'">
                {{ statusLabels[order.status] ?? order.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-right" @click.stop>
              <button
                class="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-blue-400 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ml-auto"
                @click="$emit('view', order.id)"
              >
                <Eye class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
