<script setup lang="ts">
import { Download, RefreshCw, Search } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const router = useRouter()
const { apiFetch } = useAdminFetch()

const search = ref('')
const filterStatus = ref('')
const filterDelivery = ref('')
const page = ref(1)

const orders = ref<unknown[]>([])
const pagination = ref<{ total: number; totalPages: number } | null>(null)
const pending = ref(false)

async function loadOrders() {
  pending.value = true
  try {
    const q: Record<string, unknown> = { page: page.value }
    if (search.value) q.search = search.value
    if (filterStatus.value) q.status = filterStatus.value
    if (filterDelivery.value) q.delivery_method = filterDelivery.value
    const res = await apiFetch<{ orders: unknown[]; pagination: { total: number; totalPages: number } }>(
      `/api/admin/orders?${new URLSearchParams(q as Record<string, string>)}`
    )
    orders.value = res.orders
    pagination.value = res.pagination
  } catch { /* silently fail */ }
  finally { pending.value = false }
}

onMounted(loadOrders)
watch([search, filterStatus, filterDelivery, page], loadOrders)

async function exportCSV() {
  const params = new URLSearchParams()
  if (filterStatus.value) params.set('status', filterStatus.value)
  const token = await useAdminFetch().getToken()
  const res = await fetch(`/api/admin/orders/export?${params}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `pedidos-${Date.now()}.csv`
  a.click()
}

useHead({ title: 'Pedidos — Admin' })
</script>

<template>
  <div>
    <AdminPageHeader title="Pedidos" description="Gerencie todos os pedidos da loja">
      <template #actions>
        <button
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all min-h-[44px] text-sm"
          @click="exportCSV"
        >
          <Download class="w-4 h-4" />
          Exportar CSV
        </button>
      </template>
    </AdminPageHeader>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input v-model="search" type="text" placeholder="Buscar por número, cliente ou email..." class="w-full h-11 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-gray-500" />
      </div>
      <select v-model="filterStatus" class="h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
        <option value="">Todos os status</option>
        <option value="pending">Pendente</option>
        <option value="paid">Pago</option>
        <option value="preparing">Preparando</option>
        <option value="ready_for_pickup">Pronto p/ Retirada</option>
        <option value="shipped">Enviado</option>
        <option value="delivered">Entregue</option>
        <option value="cancelled">Cancelado</option>
      </select>
      <select v-model="filterDelivery" class="h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
        <option value="">Todos os tipos</option>
        <option value="pickup">Retirada</option>
        <option value="shipping">Entrega</option>
      </select>
      <button class="h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-gray-200 transition-colors" @click="loadOrders">
        <RefreshCw class="w-4 h-4" :class="pending ? 'animate-spin' : ''" />
      </button>
    </div>

    <OrdersTable :orders="orders as never[]" :loading="pending" @view="(id) => router.push(`/admin/pedidos/${id}`)" />

    <div v-if="pagination && pagination.totalPages > 1" class="flex items-center justify-between mt-4">
      <p class="text-sm text-gray-400">{{ pagination.total }} pedidos</p>
      <div class="flex gap-2">
        <button :disabled="page <= 1" class="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors" @click="page--">Anterior</button>
        <span class="px-3 py-2 text-sm text-gray-400">{{ page }} / {{ pagination.totalPages }}</span>
        <button :disabled="page >= pagination.totalPages" class="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors" @click="page++">Próxima</button>
      </div>
    </div>
  </div>
</template>
