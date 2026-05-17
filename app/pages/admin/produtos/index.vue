<script setup lang="ts">
import { Plus, Search, RefreshCw } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const router = useRouter()
const { success: toastSuccess, error: toastError } = useToast()
const { apiFetch } = useAdminFetch()
const { playDelete, playSuccess, playError } = useSound()

const search = ref('')
const filterActive = ref('')
const filterLowStock = ref(false)
const page = ref(1)
const selectedIds = ref<string[]>([])

interface Product {
  id: string; name: string; slug: string; price: number; stock: number
  featured: boolean; active: boolean; images: string[]
  categories: { name: string; slug: string } | null
}
interface ProductsResponse {
  products: Product[]
  pagination: { total: number; totalPages: number }
}

const data = ref<ProductsResponse | null>(null)
const pending = ref(false)

async function loadProducts() {
  pending.value = true
  try {
    const q: Record<string, unknown> = { page: page.value }
    if (search.value) q.search = search.value
    if (filterActive.value) q.active = filterActive.value
    if (filterLowStock.value) q.low_stock = true
    data.value = await apiFetch<ProductsResponse>(`/api/admin/products?${new URLSearchParams(q as Record<string, string>)}`)
  } catch { toastError('Erro ao carregar produtos') }
  finally { pending.value = false }
}

onMounted(loadProducts)
watch([search, filterActive, filterLowStock, page], loadProducts)

const products = computed(() => data.value?.products ?? [])
const pagination = computed(() => data.value?.pagination)

function toggleSelect(id: string) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function toggleSelectAll() {
  if (selectedIds.value.length === products.value.length) selectedIds.value = []
  else selectedIds.value = products.value.map((p) => p.id)
}

async function bulkDeactivate() {
  for (const id of selectedIds.value) {
    await apiFetch(`/api/admin/products/${id}`, { method: 'PATCH', body: { active: false } })
  }
  toastSuccess(`${selectedIds.value.length} produtos desativados`)
  playSuccess()
  selectedIds.value = []
  loadProducts()
}

async function handleDelete(id: string) {
  try {
    const result = await apiFetch<{ deleted: boolean; message?: string }>(`/api/admin/products/${id}`, { method: 'DELETE' })
    toastSuccess(result.message ?? 'Produto removido')
    playDelete()
    loadProducts()
  } catch {
    toastError('Erro ao deletar produto')
    playError()
  }
}

useHead({ title: 'Produtos — Admin' })
</script>

<template>
  <div>
    <AdminPageHeader title="Produtos" description="Gerencie todos os produtos da loja">
      <template #actions>
        <NuxtLink
          to="/admin/produtos/novo"
          class="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2.5 rounded-xl min-h-[44px] transition-all active:scale-[0.97]"
        >
          <Plus class="w-4 h-4" />
          Novo Produto
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          v-model="search"
          type="text"
          placeholder="Buscar produtos..."
          class="w-full h-11 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-gray-500"
        >
      </div>
      <select v-model="filterActive" class="h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
        <option value="">Todos os status</option>
        <option value="true">Ativos</option>
        <option value="false">Inativos</option>
      </select>
      <label class="flex items-center gap-2 h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl cursor-pointer">
        <input v-model="filterLowStock" type="checkbox" class="rounded border-gray-600 bg-gray-700 text-rose-500" />
        <span class="text-sm text-gray-300 whitespace-nowrap">Estoque baixo</span>
      </label>
      <button class="h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-gray-200 transition-colors" @click="loadProducts">
        <RefreshCw class="w-4 h-4" :class="pending ? 'animate-spin' : ''" />
      </button>
    </div>

    <!-- Bulk actions -->
    <div v-if="selectedIds.length > 0" class="flex items-center gap-3 mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
      <span class="text-sm text-rose-400 font-medium">{{ selectedIds.length }} selecionados</span>
      <button class="text-sm text-gray-400 hover:text-amber-400 transition-colors" @click="bulkDeactivate">Desativar</button>
      <button class="text-sm text-gray-400 hover:text-gray-200 transition-colors ml-auto" @click="selectedIds = []">Limpar seleção</button>
    </div>

    <ProductsTable
      :products="products"
      :loading="pending"
      :selected-ids="selectedIds"
      @select="toggleSelect"
      @select-all="toggleSelectAll"
      @edit="(id) => router.push(`/admin/produtos/${id}`)"
      @delete="handleDelete"
    />

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="flex items-center justify-between mt-4">
      <p class="text-sm text-gray-400">{{ pagination.total }} produtos</p>
      <div class="flex gap-2">
        <button :disabled="page <= 1" class="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors" @click="page--">Anterior</button>
        <span class="px-3 py-2 text-sm text-gray-400">{{ page }} / {{ pagination.totalPages }}</span>
        <button :disabled="page >= pagination.totalPages" class="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors" @click="page++">Próxima</button>
      </div>
    </div>
  </div>
</template>
