<script setup lang="ts">
import { Save, RefreshCw } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { apiFetch } = useAdminFetch()
const { success: toastSuccess, error: toastError } = useToast()
const { playSave, playError } = useSound()
const saving = ref(false)
const loading = ref(false)

const form = reactive({
  store_address: { street: '', city: '', state: '', zip: '' },
  store_hours: { weekdays: '9h às 18h', saturday: '9h às 14h', sunday: 'Fechado' },
  shipping_cost: '15.90',
  gift_wrap_cost: '0',
  low_stock_threshold: '10',
  email_notifications: true,
})

async function loadSettings() {
  loading.value = true
  try {
    const s = await apiFetch<Record<string, unknown>>('/api/admin/settings')
    if (s.store_address) Object.assign(form.store_address, s.store_address)
    if (s.store_hours) Object.assign(form.store_hours, s.store_hours)
    if (s.shipping_cost !== undefined) form.shipping_cost = String(s.shipping_cost)
    if (s.gift_wrap_cost !== undefined) form.gift_wrap_cost = String(s.gift_wrap_cost)
    if (s.low_stock_threshold !== undefined) form.low_stock_threshold = String(s.low_stock_threshold)
    if (s.email_notifications !== undefined) form.email_notifications = Boolean(s.email_notifications)
  } catch { /* silently fail */ }
  finally { loading.value = false }
}

onMounted(loadSettings)

async function save() {
  saving.value = true
  try {
    await apiFetch('/api/admin/settings', {
      method: 'PATCH',
      body: {
        store_address: form.store_address,
        store_hours: form.store_hours,
        shipping_cost: Number(form.shipping_cost),
        gift_wrap_cost: Number(form.gift_wrap_cost),
        low_stock_threshold: Number(form.low_stock_threshold),
        email_notifications: form.email_notifications,
      },
    })
    toastSuccess('Configurações salvas!')
    playSave()
  } catch {
    toastError('Erro ao salvar configurações')
    playError()
  } finally {
    saving.value = false
  }
}

useHead({ title: 'Configurações — Admin' })
</script>

<template>
  <div>
    <AdminPageHeader title="Configurações" description="Configurações gerais da loja" />

    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="w-8 h-8 border-2 border-gray-600 border-t-rose-400 rounded-full animate-spin" />
    </div>

    <form v-else class="space-y-6 max-w-2xl" @submit.prevent="save">
      <!-- Store address -->
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-4">
        <h3 class="font-semibold text-gray-200">Endereço da Loja</h3>
        <div>
          <label class="block text-sm text-gray-400 mb-1">Rua / Avenida</label>
          <input v-model="form.store_address.street" type="text" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Cidade</label>
            <input v-model="form.store_address.city" type="text" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Estado</label>
            <input v-model="form.store_address.state" type="text" maxlength="2" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1">CEP</label>
          <input v-model="form.store_address.zip" type="text" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
      </div>

      <!-- Store hours -->
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-4">
        <h3 class="font-semibold text-gray-200">Horário de Funcionamento</h3>
        <div>
          <label class="block text-sm text-gray-400 mb-1">Segunda a Sexta</label>
          <input v-model="form.store_hours.weekdays" type="text" placeholder="9h às 18h" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1">Sábado</label>
          <input v-model="form.store_hours.saturday" type="text" placeholder="9h às 14h" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1">Domingo</label>
          <input v-model="form.store_hours.sunday" type="text" placeholder="Fechado" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
      </div>

      <!-- Pricing -->
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-4">
        <h3 class="font-semibold text-gray-200">Preços e Limites</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Custo do Frete (R$)</label>
            <input v-model="form.shipping_cost" type="number" step="0.01" min="0" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Embalagem Presente (R$)</label>
            <input v-model="form.gift_wrap_cost" type="number" step="0.01" min="0" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Alerta Estoque Baixo</label>
            <input v-model="form.low_stock_threshold" type="number" min="1" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5">
        <h3 class="font-semibold text-gray-200 mb-3">Notificações</h3>
        <label class="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <input v-model="form.email_notifications" type="checkbox" class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-rose-500 focus:ring-rose-400" />
          <span class="text-sm text-gray-300">Receber notificações por e-mail para novos pedidos</span>
        </label>
      </div>

      <button
        type="submit"
        :disabled="saving"
        class="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-xl min-h-[48px] transition-all disabled:opacity-60 active:scale-[0.97]"
      >
        <component :is="saving ? RefreshCw : Save" class="w-4 h-4" :class="saving ? 'animate-spin' : ''" />
        {{ saving ? 'Salvando...' : 'Salvar Configurações' }}
      </button>
    </form>
  </div>
</template>
