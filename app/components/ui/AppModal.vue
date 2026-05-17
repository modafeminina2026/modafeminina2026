<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  bottomSheet?: boolean // mobile bottom-sheet style
}

const props = withDefaults(defineProps<Props>(), {
  bottomSheet: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

// Close on ESC
onMounted(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})

// Prevent body scroll when open
watch(() => props.modelValue, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-overlay">
      <div
        v-if="props.modelValue"
        class="fixed inset-0 z-50 flex"
        :class="props.bottomSheet ? 'items-end' : 'items-center justify-center'"
        role="dialog"
        aria-modal="true"
        :aria-label="props.title"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
          @click="close"
        />

        <!-- Panel -->
        <Transition :name="props.bottomSheet ? 'modal-sheet' : 'modal-center'">
          <div
            v-if="props.modelValue"
            class="relative z-10 bg-white w-full shadow-xl"
            :class="props.bottomSheet
              ? 'rounded-t-2xl max-h-[90vh] overflow-y-auto'
              : 'rounded-xl mx-4 md:mx-0 md:max-w-lg max-h-[90vh] overflow-y-auto'"
          >
            <!-- Header -->
            <div v-if="props.title" class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h2 class="text-base font-semibold text-gray-900">{{ props.title }}</h2>
              <button
                class="flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Fechar"
                @click="close"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Close button (no title) -->
            <button
              v-else
              class="absolute top-3 right-3 flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 text-gray-500 transition-colors z-10"
              aria-label="Fechar"
              @click="close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay-enter-active,
.modal-overlay-leave-active { transition: opacity 0.2s ease; }
.modal-overlay-enter-from,
.modal-overlay-leave-to { opacity: 0; }

.modal-center-enter-active,
.modal-center-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.modal-center-enter-from,
.modal-center-leave-to { opacity: 0; transform: scale(0.95); }

.modal-sheet-enter-active,
.modal-sheet-leave-active { transition: transform 0.25s ease; }
.modal-sheet-enter-from,
.modal-sheet-leave-to { transform: translateY(100%); }
</style>
