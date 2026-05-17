<script setup lang="ts">
import { Upload, X, Star, GripVertical } from 'lucide-vue-next'

interface UploadedImage {
  id: string | null
  public_url: string
  storage_path: string
  is_primary: boolean
  uploading?: boolean
  error?: string
}

const props = defineProps<{
  productId?: string
  modelValue?: UploadedImage[]
}>()

const emit = defineEmits<{
  'update:modelValue': [images: UploadedImage[]]
  uploaded: [image: UploadedImage]
  deleted: [id: string]
}>()

const { error: toastError } = useToast()
const { apiFetch } = useAdminFetch()
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

const images = ref<UploadedImage[]>(props.modelValue ?? [])

watch(() => props.modelValue, (val) => {
  if (val) images.value = val
})

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  uploadFiles(files)
}

function onFileChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  uploadFiles(files)
  if (fileInput.value) fileInput.value.value = ''
}

async function uploadFiles(files: File[]) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  for (const file of files) {
    if (!allowed.includes(file.type)) {
      toastError(`${file.name}: tipo não permitido`)
      continue
    }
    if (file.size > 5 * 1024 * 1024) {
      toastError(`${file.name}: máximo 5MB`)
      continue
    }
    await uploadSingle(file)
  }
}

async function uploadSingle(file: File) {
  // Optimistic UI — show preview immediately
  const tempId = `temp-${Date.now()}`
  const previewUrl = URL.createObjectURL(file)
  const tempImage: UploadedImage = {
    id: tempId,
    public_url: previewUrl,
    storage_path: '',
    is_primary: images.value.length === 0,
    uploading: true,
  }
  images.value.push(tempImage)
  emit('update:modelValue', images.value)

  try {
    const fd = new FormData()
    fd.append('file', file)
    if (props.productId) fd.append('product_id', props.productId)

    const result = await apiFetch<{ id: string | null; public_url: string; storage_path: string }>('/api/admin/upload/image', {
      method: 'POST',
      body: fd,
    })

    // Replace temp with real
    const idx = images.value.findIndex((i) => i.id === tempId)
    if (idx >= 0) {
      images.value[idx] = {
        id: result.id,
        public_url: result.public_url,
        storage_path: result.storage_path,
        is_primary: images.value[idx].is_primary,
        uploading: false,
      }
    }
    URL.revokeObjectURL(previewUrl)
    emit('update:modelValue', images.value)
    emit('uploaded', images.value[idx])
  } catch {
    const idx = images.value.findIndex((i) => i.id === tempId)
    if (idx >= 0) images.value[idx].error = 'Falha no upload'
    toastError(`Erro ao enviar ${file.name}`)
  }
}

async function removeImage(index: number) {
  const img = images.value[index]
  if (img.id && !img.id.startsWith('temp-') && props.productId) {
    try {
      await apiFetch(`/api/admin/products/${props.productId}/images/${img.id}`, { method: 'DELETE' })
      emit('deleted', img.id)
    } catch {
      toastError('Erro ao remover imagem')
      return
    }
  }
  images.value.splice(index, 1)
  // If removed primary, set first as primary
  if (img.is_primary && images.value.length > 0) {
    images.value[0].is_primary = true
  }
  emit('update:modelValue', images.value)
}

function setPrimary(index: number) {
  images.value.forEach((img, i) => { img.is_primary = i === index })
  emit('update:modelValue', images.value)
}

// Drag-to-reorder
const dragIndex = ref<number | null>(null)

function onItemDragStart(index: number) { dragIndex.value = index }
function onItemDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (dragIndex.value === null || dragIndex.value === index) return
  const moved = images.value.splice(dragIndex.value, 1)[0]
  images.value.splice(index, 0, moved)
  dragIndex.value = index
}
function onItemDragEnd() {
  dragIndex.value = null
  // Sync reorder to server
  if (props.productId) {
    apiFetch(`/api/admin/products/${props.productId}/images/reorder`, {
      method: 'PATCH',
      body: { order: images.value.map((img, i) => ({ id: img.id, display_order: i })) },
    }).catch(() => {})
  }
  emit('update:modelValue', images.value)
}
</script>

<template>
  <div class="space-y-3">
    <!-- Drop zone -->
    <div
      class="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer"
      :class="isDragging ? 'border-rose-400 bg-rose-400/5' : 'border-gray-600 hover:border-gray-500'"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="fileInput?.click()"
    >
      <Upload class="w-8 h-8 text-gray-500 mx-auto mb-2" />
      <p class="text-sm text-gray-400">
        <span class="text-rose-400 font-medium">Clique para selecionar</span> ou arraste imagens aqui
      </p>
      <p class="text-xs text-gray-500 mt-1">JPEG, PNG, WebP — máximo 5MB por arquivo</p>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        class="hidden"
        @change="onFileChange"
      >
    </div>

    <!-- Image grid -->
    <div v-if="images.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <div
        v-for="(img, index) in images"
        :key="img.id ?? index"
        class="relative group aspect-square rounded-xl overflow-hidden bg-gray-700 border border-gray-600"
        draggable="true"
        @dragstart="onItemDragStart(index)"
        @dragover="(e) => onItemDragOver(e, index)"
        @dragend="onItemDragEnd"
      >
        <!-- Image -->
        <img
          :src="img.public_url"
          :alt="`Imagem ${index + 1}`"
          class="w-full h-full object-cover"
          :class="img.uploading ? 'opacity-50' : ''"
          loading="lazy"
        >

        <!-- Upload progress overlay -->
        <div v-if="img.uploading" class="absolute inset-0 flex items-center justify-center bg-black/40">
          <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>

        <!-- Error overlay -->
        <div v-if="img.error" class="absolute inset-0 flex items-center justify-center bg-red-900/60">
          <p class="text-xs text-white text-center px-2">{{ img.error }}</p>
        </div>

        <!-- Actions overlay -->
        <div v-if="!img.uploading" class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-start justify-between p-2 opacity-0 group-hover:opacity-100">
          <!-- Drag handle -->
          <div class="p-1 bg-black/50 rounded cursor-grab active:cursor-grabbing">
            <GripVertical class="w-3 h-3 text-white" />
          </div>
          <!-- Remove -->
          <button
            class="p-1 bg-red-500/80 hover:bg-red-500 rounded transition-colors"
            aria-label="Remover imagem"
            @click.stop="removeImage(index)"
          >
            <X class="w-3 h-3 text-white" />
          </button>
        </div>

        <!-- Primary badge -->
        <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <button
            class="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all"
            :class="img.is_primary ? 'bg-amber-400 text-amber-900 font-semibold' : 'bg-black/50 text-white hover:bg-amber-400/80 hover:text-amber-900'"
            @click.stop="setPrimary(index)"
          >
            <Star class="w-3 h-3" :class="img.is_primary ? 'fill-current' : ''" />
            {{ img.is_primary ? 'Principal' : 'Definir' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
