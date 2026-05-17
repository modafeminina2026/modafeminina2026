<script setup lang="ts">
import { SlidersHorizontal, X } from 'lucide-vue-next'
import type { ProductFilters } from '~/composables/useProducts'

interface Props {
  modelValue: ProductFilters
  categories?: Array<{ id: string; name: string; slug: string }>
}

const props = withDefaults(defineProps<Props>(), { categories: () => [] })
const emit = defineEmits<{
  'update:modelValue': [filters: ProductFilters]
  apply: []
}>()

const drawerOpen = ref(false)

// Local copy for editing before applying
const local = ref<ProductFilters>({ ...props.modelValue })

watch(() => props.modelValue, (v) => { local.value = { ...v } }, { deep: true })

const SIZES = ['P', 'M', 'G', 'GG']

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Destaques' },
  { value: 'price_asc',  label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'newest',     label: 'Mais Recentes' },
]

function toggleSize(size: string) {
  const sizes = local.value.sizes ?? []
  local.value.sizes = sizes.includes(size) ? sizes.filter((s) => s !== size) : [...sizes, size]
}

function clearAll() {
  local.value = {}
  emit('update:modelValue', {})
  emit('apply')
  drawerOpen.value = false
}

function apply() {
  emit('update:modelValue', { ...local.value })
  emit('apply')
  drawerOpen.value = false
}

const activeCount = computed(() => {
  let n = 0
  if (local.value.categorySlug) n++
  if (local.value.minPrice !== undefined || local.value.maxPrice !== undefined) n++
  if (local.value.sizes?.length) n++
  if (local.value.availableForPickup) n++
  if (local.value.sort && local.value.sort !== 'featured') n++
  return n
})
</script>

<template>
  <div>
    <!-- Mobile trigger -->
    <div class="flex items-center gap-2 md:hidden">
      <button
        class="flex items-center gap-2 h-11 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 active:scale-[0.97] transition-all"
        @click="drawerOpen = true"
      >
        <SlidersHorizontal class="w-4 h-4" aria-hidden="true" />
        Filtros
        <span v-if="activeCount > 0" class="flex items-center justify-center w-5 h-5 bg-rose-600 text-white text-xs font-bold rounded-full">
          {{ activeCount }}
        </span>
      </button>

      <!-- Sort (always visible on mobile) -->
      <select
        v-model="local.sort"
        class="flex-1 h-11 px-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
        aria-label="Ordenar por"
        @change="apply"
      >
        <option v-for="opt in SORT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>

    <!-- Desktop sidebar -->
    <aside class="hidden md:block w-56 shrink-0" aria-label="Filtros de produto">
      <div class="bg-white rounded-xl border border-gray-100 p-4 space-y-5">
        <div class="flex items-center justify-between">
          <p class="font-semibold text-gray-800 text-sm">Filtros</p>
          <button v-if="activeCount > 0" class="text-xs text-rose-600 hover:underline" @click="clearAll">Limpar</button>
        </div>

        <!-- Sort -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ordenar</p>
          <select
            v-model="local.sort"
            class="w-full h-10 px-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
            @change="apply"
          >
            <option v-for="opt in SORT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <!-- Price range -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preço</p>
          <div class="flex items-center gap-2">
            <input
              v-model.number="local.minPrice"
              type="number"
              inputmode="numeric"
              placeholder="Min"
              class="w-full h-10 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              @change="apply"
            />
            <span class="text-gray-400 text-sm">–</span>
            <input
              v-model.number="local.maxPrice"
              type="number"
              inputmode="numeric"
              placeholder="Max"
              class="w-full h-10 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              @change="apply"
            />
          </div>
        </div>

        <!-- Sizes -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tamanho</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in SIZES"
              :key="size"
              class="w-11 h-11 rounded-lg border text-sm font-medium transition-colors"
              :class="local.sizes?.includes(size)
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'border-gray-200 text-gray-700 hover:border-rose-300'"
              :aria-pressed="local.sizes?.includes(size)"
              @click="toggleSize(size); apply()"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Pickup -->
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="local.availableForPickup"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-400"
            @change="apply"
          />
          <span class="text-sm text-gray-700">Retirada na Loja</span>
        </label>
      </div>
    </aside>

    <!-- Mobile drawer -->
    <AppModal v-model="drawerOpen" title="Filtros" bottom-sheet>
      <div class="p-4 space-y-5 pb-32">
        <!-- Sort -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ordenar</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="opt in SORT_OPTIONS"
              :key="opt.value"
              class="h-11 rounded-lg border text-sm font-medium transition-colors"
              :class="local.sort === opt.value
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'border-gray-200 text-gray-700 hover:border-rose-300'"
              @click="local.sort = opt.value as ProductFilters['sort']"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Price -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preço (R$)</p>
          <div class="flex items-center gap-3">
            <input v-model.number="local.minPrice" type="number" inputmode="numeric" placeholder="Mínimo"
              class="flex-1 h-12 px-3 rounded-lg border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" />
            <span class="text-gray-400">–</span>
            <input v-model.number="local.maxPrice" type="number" inputmode="numeric" placeholder="Máximo"
              class="flex-1 h-12 px-3 rounded-lg border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>

        <!-- Sizes -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tamanho</p>
          <div class="flex gap-3">
            <button
              v-for="size in SIZES"
              :key="size"
              class="flex-1 h-12 rounded-lg border text-sm font-medium transition-colors"
              :class="local.sizes?.includes(size)
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'border-gray-200 text-gray-700'"
              :aria-pressed="local.sizes?.includes(size)"
              @click="toggleSize(size)"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Pickup -->
        <label class="flex items-center gap-3 cursor-pointer py-1">
          <input v-model="local.availableForPickup" type="checkbox"
            class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-400" />
          <span class="text-base text-gray-700">Disponível para Retirada na Loja</span>
        </label>
      </div>

      <!-- Sticky bottom actions -->
      <div class="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
        <button class="flex-1 h-12 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="clearAll">
          <X class="w-4 h-4 inline mr-1" aria-hidden="true" />Limpar
        </button>
        <button class="flex-1 h-12 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium active:scale-[0.97] transition-all" @click="apply">
          Aplicar Filtros
        </button>
      </div>
    </AppModal>
  </div>
</template>
