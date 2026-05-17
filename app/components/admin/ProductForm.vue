<script setup lang="ts">
import { Save, RefreshCw } from 'lucide-vue-next'

const props = defineProps<{
  mode: 'create' | 'edit'
  productId?: string
}>()

const emit = defineEmits<{ saved: [id: string]; deleted: [] }>()

const { success: toastSuccess, error: toastError } = useToast()
const router = useRouter()
const { apiFetch } = useAdminFetch()
const { playSave, playDelete, playError } = useSound()

// Form state
const form = reactive({
  name: '',
  slug: '',
  description: '',
  category_id: '',
  price: '',
  original_price: '',
  stock: '0',
  brand: '',
  featured: false,
  active: true,
  available_for_pickup: true,
  sizes: [] as string[],
  colors: [] as string[],
  images: [] as string[],
})

const loading = ref(false)
const loadingProduct = ref(false)
const showDeleteConfirm = ref(false)
const categories = ref<{ id: string; name: string }[]>([])

// Images state for ImageUploader
interface UploadedImage {
  id: string | null
  public_url: string
  storage_path: string
  is_primary: boolean
  uploading?: boolean
}
const uploadedImages = ref<UploadedImage[]>([])

// Sync uploadedImages → form.images
watch(uploadedImages, (imgs) => {
  form.images = imgs
    .filter((i) => !i.uploading && i.public_url)
    .map((i) => i.public_url)
}, { deep: true })

function onImageUploaded(img: UploadedImage) {
  // Image already added to uploadedImages by the component
  // Just ensure form.images stays in sync
  form.images = uploadedImages.value
    .filter((i) => !i.uploading && i.public_url)
    .map((i) => i.public_url)
}

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único']
const COLORS = ['Preto', 'Branco', 'Rosa', 'Vermelho', 'Azul', 'Verde', 'Roxo', 'Bege', 'Dourado', 'Prata']

// Auto-generate slug from name
watch(() => form.name, (val) => {
  if (props.mode === 'create') {
    form.slug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
})

// Auto-save draft
let autoSaveTimer: ReturnType<typeof setInterval>
onMounted(async () => {
  // Load categories (public endpoint, no auth needed)
  const catRes = await $fetch<{ id: string; name: string }[]>('/api/categories').catch(() => [])
  categories.value = Array.isArray(catRes) ? catRes : []

  // Load product if editing
  if (props.mode === 'edit' && props.productId) {
    loadingProduct.value = true
    try {
      const product = await apiFetch<Record<string, unknown>>(`/api/admin/products/${props.productId}`)
      Object.assign(form, {
        name: product.name,
        slug: product.slug,
        description: product.description ?? '',
        category_id: product.category_id ?? '',
        price: String(product.price),
        original_price: product.original_price ? String(product.original_price) : '',
        stock: String(product.stock),
        brand: product.brand ?? '',
        featured: product.featured,
        active: product.active,
        available_for_pickup: product.available_for_pickup,
        sizes: (product.sizes as string[]) ?? [],
        colors: (product.colors as string[]) ?? [],
        images: (product.images as string[]) ?? [],
      })
      // Populate image uploader with existing images
      uploadedImages.value = ((product.images as string[]) ?? []).map((url, i) => ({
        id: null,
        public_url: url,
        storage_path: '',
        is_primary: i === 0,
      }))
    } finally {
      loadingProduct.value = false
    }
  } else {
    const draft = localStorage.getItem('admin-product-draft')
    if (draft) Object.assign(form, JSON.parse(draft))
  }

  autoSaveTimer = setInterval(() => {
    if (props.mode === 'create') {
      localStorage.setItem('admin-product-draft', JSON.stringify(form))
    }
  }, 30000)
})

onUnmounted(() => clearInterval(autoSaveTimer))

function toggleSize(size: string) {
  const idx = form.sizes.indexOf(size)
  if (idx >= 0) form.sizes.splice(idx, 1)
  else form.sizes.push(size)
}

function toggleColor(color: string) {
  const idx = form.colors.indexOf(color)
  if (idx >= 0) form.colors.splice(idx, 1)
  else form.colors.push(color)
}

async function save() {
  if (!form.name || !form.slug || !form.price) {
    toastError('Preencha nome, slug e preço')
    return
  }

  loading.value = true
  try {
    const payload = {
      ...form,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      stock: Number(form.stock),
      category_id: form.category_id || null,
    }

    if (props.mode === 'create') {
      const data = await apiFetch<{ id: string }>('/api/admin/products', { method: 'POST', body: payload })
      localStorage.removeItem('admin-product-draft')
      toastSuccess('Produto criado com sucesso!')
      playSave()
      emit('saved', data.id)
      router.push(`/admin/produtos/${data.id}`)
    } else {
      await apiFetch(`/api/admin/products/${props.productId}`, { method: 'PATCH', body: payload })
      toastSuccess('Produto atualizado!')
      playSave()
      emit('saved', props.productId!)
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar produto'
    toastError(msg)
    playError()
  } finally {
    loading.value = false
  }
}

async function deleteProduct() {
  if (!props.productId) return
  loading.value = true
  try {
    const result = await apiFetch<{ deleted: boolean; message?: string }>(`/api/admin/products/${props.productId}`, { method: 'DELETE' })
    toastSuccess(result.message ?? 'Produto removido!')
    playDelete()
    emit('deleted')
    router.push('/admin/produtos')
  } catch {
    toastError('Erro ao deletar produto')
    playError()
  } finally {
    loading.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="loadingProduct" class="flex items-center justify-center py-16">
      <div class="w-8 h-8 border-2 border-gray-600 border-t-rose-400 rounded-full animate-spin" />
    </div>

    <form v-else class="space-y-6" @submit.prevent="save">
      <!-- Basic info -->
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-4">
        <h3 class="font-semibold text-gray-200">Informações Básicas</h3>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Nome <span class="text-red-400">*</span></label>
          <input v-model="form.name" type="text" required class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-gray-500" placeholder="Nome do produto" />
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Slug <span class="text-red-400">*</span></label>
          <input v-model="form.slug" type="text" required class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono text-sm" placeholder="slug-do-produto" />
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Descrição</label>
          <textarea v-model="form.description" rows="4" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none placeholder:text-gray-500" placeholder="Descrição do produto..." />
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Categoria</label>
          <select v-model="form.category_id" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400">
            <option value="">Sem categoria</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Marca</label>
          <input v-model="form.brand" type="text" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-gray-500" placeholder="Nome da marca" />
        </div>
      </div>

      <!-- Pricing & Stock -->
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-4">
        <h3 class="font-semibold text-gray-200">Preço e Estoque</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Preço (R$) <span class="text-red-400">*</span></label>
            <input v-model="form.price" type="number" step="0.01" min="0" required class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="0,00" />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Preço Original (R$)</label>
            <input v-model="form.original_price" type="number" step="0.01" min="0" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="0,00" />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Estoque</label>
            <input v-model="form.stock" type="number" min="0" class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="0" />
          </div>
        </div>
      </div>

      <!-- Sizes & Colors -->
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-4">
        <h3 class="font-semibold text-gray-200">Tamanhos e Cores</h3>
        <div>
          <label class="block text-sm text-gray-400 mb-2">Tamanhos</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in SIZES"
              :key="size"
              type="button"
              class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all min-h-[36px]"
              :class="form.sizes.includes(size) ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'"
              @click="toggleSize(size)"
            >
              {{ size }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-2">Cores</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in COLORS"
              :key="color"
              type="button"
              class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all min-h-[36px]"
              :class="form.colors.includes(color) ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'"
              @click="toggleColor(color)"
            >
              {{ color }}
            </button>
          </div>
        </div>
      </div>

      <!-- Options -->
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-3">
        <h3 class="font-semibold text-gray-200 mb-3">Opções</h3>
        <label class="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <input v-model="form.active" type="checkbox" class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-rose-500 focus:ring-rose-400" />
          <span class="text-sm text-gray-300">Produto ativo (visível no site)</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <input v-model="form.featured" type="checkbox" class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-rose-500 focus:ring-rose-400" />
          <span class="text-sm text-gray-300">Produto em destaque</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <input v-model="form.available_for_pickup" type="checkbox" class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-rose-500 focus:ring-rose-400" />
          <span class="text-sm text-gray-300">Disponível para retirada na loja</span>
        </label>
      </div>

      <!-- Images -->
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-3">
        <h3 class="font-semibold text-gray-200">Imagens do Produto</h3>
        <p class="text-xs text-gray-500">Arraste ou clique para fazer upload. A primeira imagem é a principal.</p>
        <ImageUploader
          v-model="uploadedImages"
          :product-id="mode === 'edit' ? productId : undefined"
          @uploaded="onImageUploaded"
        />
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl min-h-[48px] transition-all disabled:opacity-60 active:scale-[0.97]"
        >
          <component :is="loading ? RefreshCw : Save" class="w-4 h-4" :class="loading ? 'animate-spin' : ''" />
          {{ loading ? 'Salvando...' : (mode === 'create' ? 'Criar Produto' : 'Salvar Alterações') }}
        </button>

        <button
          v-if="mode === 'edit'"
          type="button"
          class="px-6 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all min-h-[48px] font-medium"
          @click="showDeleteConfirm = true"
        >
          Deletar
        </button>
      </div>
    </form>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div class="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-sm w-full">
          <h3 class="font-bold text-gray-100 mb-2">Confirmar exclusão</h3>
          <p class="text-sm text-gray-400 mb-6">Esta ação não pode ser desfeita. O produto será removido permanentemente.</p>
          <div class="flex gap-3">
            <button class="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all" @click="deleteProduct">
              Sim, deletar
            </button>
            <button class="flex-1 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold transition-all" @click="showDeleteConfirm = false">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
