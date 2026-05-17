<script setup lang="ts">
import { Copy, Check, Package, Truck, MapPin, CreditCard, Gift, Clock } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const { success: toastSuccess, error: toastError } = useToast()
const { apiFetch } = useAdminFetch()
const { playSuccess, playNotification, playError, playSave } = useSound()
const id = route.params.id as string

const order = ref<Record<string, unknown> | null>(null)
const o = computed(() => order.value)

async function loadOrder() {
  try {
    order.value = await apiFetch<Record<string, unknown>>(`/api/admin/orders/${id}`)
  } catch { toastError('Erro ao carregar pedido') }
}

onMounted(loadOrder)

const copied = ref(false)
const updatingStatus = ref(false)

async function copyCode() {
  const code = o.value?.pickup_code as string
  if (!code) return
  await navigator.clipboard.writeText(code)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

async function markReady() {
  updatingStatus.value = true
  try {
    await apiFetch(`/api/admin/orders/${id}/pickup-ready`, { method: 'POST' })
    toastSuccess('Pedido marcado como pronto para retirada!')
    playNotification()
    loadOrder()
  } catch { toastError('Erro ao atualizar status'); playError() }
  finally { updatingStatus.value = false }
}

async function markPickedUp() {
  updatingStatus.value = true
  try {
    await apiFetch(`/api/admin/orders/${id}/picked-up`, { method: 'POST' })
    toastSuccess('Pedido marcado como retirado!')
    playSuccess()
    loadOrder()
  } catch { toastError('Erro ao atualizar status'); playError() }
  finally { updatingStatus.value = false }
}

async function updateStatus(status: string) {
  updatingStatus.value = true
  try {
    await apiFetch(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: { status } })
    toastSuccess('Status atualizado!')
    playSave()
    loadOrder()
  } catch { toastError('Erro ao atualizar status'); playError() }
  finally { updatingStatus.value = false }
}

function formatPrice(v: unknown) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(d: unknown) {
  return new Date(d as string).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente', paid: 'Pago', preparing: 'Preparando',
  ready_for_pickup: 'Pronto p/ Retirada', shipped: 'Enviado',
  delivered: 'Entregue', cancelled: 'Cancelado',
}

useHead({ title: computed(() => `Pedido ${(o.value?.order_number as string) ?? ''} — Admin`) })
</script>

<template>
  <div>
    <AdminPageHeader :title="`Pedido ${(o?.order_number as string) ?? ''}`" :description="`Criado em ${o ? formatDate(o.created_at) : ''}`">
      <template #actions>
        <NuxtLink to="/admin/pedidos" class="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all min-h-[44px] flex items-center text-sm">
          ← Voltar
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <div v-if="!o" class="text-center py-16 text-gray-400">Carregando...</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left column -->
      <div class="lg:col-span-2 space-y-4">

        <!-- Pickup code (destaque) -->
        <div v-if="o.delivery_method === 'pickup'" class="bg-gradient-to-r from-purple-900/40 to-rose-900/40 border border-purple-500/30 rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-3">
            <MapPin class="w-5 h-5 text-purple-400" />
            <h2 class="font-semibold text-gray-200">Retirada na Loja</h2>
          </div>
          <div class="flex items-center gap-4 mb-4">
            <div class="text-5xl font-mono font-bold text-purple-300 tracking-[0.3em]">
              {{ o.pickup_code }}
            </div>
            <button
              class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm transition-all"
              @click="copyCode"
            >
              <component :is="copied ? Check : Copy" class="w-4 h-4" />
              {{ copied ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-if="o.pickup_status === 'waiting'"
              :disabled="updatingStatus"
              class="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-all disabled:opacity-60"
              @click="markReady"
            >
              ✅ Marcar como Pronto
            </button>
            <button
              v-if="o.pickup_status === 'ready'"
              :disabled="updatingStatus"
              class="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all disabled:opacity-60"
              @click="markPickedUp"
            >
              📦 Marcar como Retirado
            </button>
            <span v-if="o.pickup_status === 'picked_up'" class="px-3 py-2 rounded-xl bg-gray-700 text-gray-400 text-sm">
              ✓ Retirado pelo cliente
            </span>
          </div>
        </div>

        <!-- Items -->
        <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-4">
            <Package class="w-4 h-4 text-gray-400" />
            <h2 class="font-semibold text-gray-200">Itens do Pedido</h2>
          </div>
          <div class="space-y-3">
            <div
              v-for="item in (o.order_items as Record<string, unknown>[])"
              :key="item.id as string"
              class="flex items-center gap-3"
            >
              <img
                v-if="(item.products as Record<string, unknown>)?.images?.[0]"
                :src="((item.products as Record<string, unknown>).images as string[])[0]"
                :alt="item.product_name as string"
                class="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                loading="lazy"
              >
              <div v-else class="w-12 h-12 bg-gray-700 rounded-lg flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-gray-200 text-sm font-medium truncate">{{ item.product_name }}</p>
                <p class="text-xs text-gray-500">
                  Qtd: {{ item.quantity }}
                  <span v-if="item.size"> · {{ item.size }}</span>
                  <span v-if="item.color"> · {{ item.color }}</span>
                </p>
              </div>
              <p class="text-gray-200 text-sm font-semibold flex-shrink-0">
                {{ formatPrice(Number(item.unit_price) * Number(item.quantity)) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Payment -->
        <div v-if="(o.payment_transactions as unknown[])?.length" class="bg-gray-800 border border-gray-700 rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-3">
            <CreditCard class="w-4 h-4 text-gray-400" />
            <h2 class="font-semibold text-gray-200">Pagamento</h2>
          </div>
          <div v-for="tx in (o.payment_transactions as Record<string, unknown>[])" :key="tx.id as string" class="text-sm space-y-1">
            <p class="text-gray-300">
              {{ tx.card_brand }} •••• {{ tx.card_last4 }}
              <span class="text-gray-500 ml-2 capitalize">{{ tx.card_type }}</span>
            </p>
            <p class="text-gray-400">{{ tx.cardholder_name }}</p>
            <a v-if="tx.receipt_url" :href="tx.receipt_url as string" target="_blank" class="text-blue-400 hover:text-blue-300 text-xs">Ver recibo →</a>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="space-y-4">
        <!-- Status -->
        <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5">
          <h2 class="font-semibold text-gray-200 mb-3">Status do Pedido</h2>
          <select
            :value="o.status as string"
            :disabled="updatingStatus"
            class="w-full h-11 px-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-60"
            @change="updateStatus(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="(label, val) in statusLabels" :key="val" :value="val">{{ label }}</option>
          </select>
        </div>

        <!-- Customer -->
        <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5">
          <h2 class="font-semibold text-gray-200 mb-3">Cliente</h2>
          <div class="space-y-1 text-sm">
            <p class="text-gray-200">{{ (o.guest_name as string) ?? (o.profiles as Record<string, unknown>)?.full_name ?? '—' }}</p>
            <p class="text-gray-400">{{ (o.guest_email as string) ?? (o.profiles as Record<string, unknown>)?.email ?? '—' }}</p>
            <p v-if="o.guest_phone" class="text-gray-400">{{ o.guest_phone }}</p>
          </div>
        </div>

        <!-- Gift -->
        <div v-if="o.gift_wrap || o.gift_message" class="bg-gray-800 border border-gray-700 rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-3">
            <Gift class="w-4 h-4 text-rose-400" />
            <h2 class="font-semibold text-gray-200">Presente</h2>
          </div>
          <p v-if="o.gift_wrap" class="text-sm text-green-400 mb-2">✓ Embalagem de presente</p>
          <p v-if="o.gift_message" class="text-sm text-gray-300 italic">"{{ o.gift_message }}"</p>
        </div>

        <!-- Summary -->
        <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5">
          <h2 class="font-semibold text-gray-200 mb-3">Resumo</h2>
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between text-gray-400">
              <span>Subtotal</span><span>{{ formatPrice(o.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-gray-400">
              <span>Frete</span>
              <span :class="Number(o.shipping_cost) === 0 ? 'text-green-400' : ''">
                {{ Number(o.shipping_cost) === 0 ? 'GRÁTIS' : formatPrice(o.shipping_cost) }}
              </span>
            </div>
            <div class="flex justify-between font-bold text-gray-100 border-t border-gray-700 pt-2 mt-2">
              <span>Total</span><span>{{ formatPrice(o.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
