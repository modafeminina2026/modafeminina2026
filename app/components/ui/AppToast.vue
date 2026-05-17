<script setup lang="ts">
import type { Toast } from '~/composables/useToast'

const { toasts, remove } = useToast()
const { playSuccess, playError, playNotification } = useSound()

// Play sound when a new toast is added
// Note: composables that already play a specific sound should NOT rely on this
// This is a fallback for toasts that don't have explicit sound calls
const soundedToastIds = new Set<string>()

watch(toasts, (newToasts) => {
  if (!import.meta.client) return
  for (const toast of newToasts) {
    if (soundedToastIds.has(toast.id)) continue
    soundedToastIds.add(toast.id)
    switch (toast.type) {
      case 'success': playSuccess(); break
      case 'error':   playError(); break
      case 'warning':
      case 'info':    playNotification(); break
    }
  }
}, { deep: true })

const iconMap: Record<string, string> = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error:   'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const colorMap: Record<string, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
}

const iconColorMap: Record<string, string> = {
  success: 'text-green-500',
  error:   'text-red-500',
  warning: 'text-yellow-500',
  info:    'text-blue-500',
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed z-[100] flex flex-col gap-2 pointer-events-none
             top-4 left-4 right-4
             md:left-auto md:right-4 md:w-80"
      aria-live="polite"
      aria-label="Notificações"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg"
          :class="colorMap[toast.type]"
          role="alert"
        >
          <svg class="w-5 h-5 shrink-0 mt-0.5" :class="iconColorMap[toast.type]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconMap[toast.type]" />
          </svg>

          <p class="flex-1 text-sm font-medium leading-snug">{{ toast.message }}</p>

          <button
            class="shrink-0 w-6 h-6 flex items-center justify-center rounded opacity-60 hover:opacity-100 transition-opacity"
            :aria-label="`Fechar notificação: ${toast.message}`"
            @click="remove(toast.id)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateY(-8px) scale(0.97); }
.toast-leave-to     { opacity: 0; transform: translateX(20px); }
.toast-move         { transition: transform 0.2s ease; }
</style>
