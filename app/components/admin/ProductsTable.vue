<script setup lang="ts">
import { Edit2, Trash2, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-vue-next'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  featured: boolean
  active: boolean
  images: string[]
  categories: { name: string; slug: string } | null
}

const props = defineProps<{
  products: Product[]
  loading?: boolean
  selectedIds?: string[]
}>()

const emit = defineEmits<{
  select: [id: string]
  selectAll: []
  edit: [id: string]
  delete: [id: string]
}>()

const sortField = ref<string>('name')
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(field: string) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDir.value = 'asc'
  }
}

const sorted = computed(() => {
  return [...props.products].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortField.value]
    const bv = (b as Record<string, unknown>)[sortField.value]
    if (av === bv) return 0
    const cmp = av! < bv! ? -1 : 1
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

function formatPrice(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const allSelected = computed(() =>
  props.products.length > 0 && props.products.every((p) => props.selectedIds?.includes(p.id)),
)
</script>

<template>
  <div class="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
    <!-- Loading -->
    <div v-if="loading" class="p-8 text-center text-gray-400">
      <div class="w-8 h-8 border-2 border-gray-600 border-t-rose-400 rounded-full animate-spin mx-auto mb-2" />
      Carregando produtos...
    </div>

    <!-- Empty -->
    <div v-else-if="products.length === 0" class="p-12 text-center">
      <p class="text-gray-400 text-sm">Nenhum produto cadastrado</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wide">
            <th class="px-4 py-3 text-left w-10">
              <input
                type="checkbox"
                :checked="allSelected"
                class="rounded border-gray-600 bg-gray-700 text-rose-500 focus:ring-rose-400"
                @change="$emit('selectAll')"
              >
            </th>
            <th class="px-4 py-3 text-left w-14">Foto</th>
            <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-200" @click="toggleSort('name')">
              <span class="flex items-center gap-1">
                Nome
                <component :is="sortField === 'name' && sortDir === 'asc' ? ChevronUp : ChevronDown" class="w-3 h-3" />
              </span>
            </th>
            <th class="px-4 py-3 text-left">Categoria</th>
            <th class="px-4 py-3 text-right cursor-pointer hover:text-gray-200" @click="toggleSort('price')">
              <span class="flex items-center justify-end gap-1">
                Preço
                <component :is="sortField === 'price' && sortDir === 'asc' ? ChevronUp : ChevronDown" class="w-3 h-3" />
              </span>
            </th>
            <th class="px-4 py-3 text-right cursor-pointer hover:text-gray-200" @click="toggleSort('stock')">
              <span class="flex items-center justify-end gap-1">
                Estoque
                <component :is="sortField === 'stock' && sortDir === 'asc' ? ChevronUp : ChevronDown" class="w-3 h-3" />
              </span>
            </th>
            <th class="px-4 py-3 text-center">Status</th>
            <th class="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700/50">
          <tr
            v-for="product in sorted"
            :key="product.id"
            class="hover:bg-gray-700/30 transition-colors cursor-pointer"
            @click="$emit('edit', product.id)"
          >
            <td class="px-4 py-3" @click.stop>
              <input
                type="checkbox"
                :checked="selectedIds?.includes(product.id)"
                class="rounded border-gray-600 bg-gray-700 text-rose-500 focus:ring-rose-400"
                @change="$emit('select', product.id)"
              >
            </td>
            <td class="px-4 py-3">
              <img
                v-if="product.images?.[0]"
                :src="product.images[0]"
                :alt="product.name"
                class="w-10 h-10 object-cover rounded-lg"
                loading="lazy"
              >
              <div v-else class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                📷
              </div>
            </td>
            <td class="px-4 py-3">
              <p class="font-medium text-gray-200 truncate max-w-[200px]">{{ product.name }}</p>
              <p class="text-xs text-gray-500">{{ product.slug }}</p>
            </td>
            <td class="px-4 py-3 text-gray-400 text-xs">
              {{ product.categories?.name ?? '—' }}
            </td>
            <td class="px-4 py-3 text-right font-medium text-gray-200">
              {{ formatPrice(product.price) }}
            </td>
            <td class="px-4 py-3 text-right">
              <span
                class="inline-flex items-center gap-1 text-xs font-medium"
                :class="product.stock < 10 ? 'text-amber-400' : 'text-gray-300'"
              >
                <AlertTriangle v-if="product.stock < 10" class="w-3 h-3" />
                {{ product.stock }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full"
                :class="product.active ? 'bg-green-400/10 text-green-400' : 'bg-gray-600/50 text-gray-400'"
              >
                {{ product.active ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right" @click.stop>
              <div class="flex items-center justify-end gap-1">
                <button
                  class="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-blue-400 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Editar"
                  @click="$emit('edit', product.id)"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button
                  class="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Deletar"
                  @click="$emit('delete', product.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
