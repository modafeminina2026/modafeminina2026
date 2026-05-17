<script setup lang="ts">
interface Props {
  text: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Copiar',
})

const { success, error } = useToast()
const { playSave } = useSound()
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    success(`Copiado! 📋`)
    playSave()
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    error('Não foi possível copiar')
  }
}
</script>

<template>
  <button
    class="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-lg border font-medium text-sm transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
    :class="copied
      ? 'bg-green-50 border-green-300 text-green-700'
      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
    :aria-label="copied ? 'Copiado!' : `${props.label}: ${props.text}`"
    @click="copy"
  >
    <!-- Copy icon -->
    <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
    <!-- Check icon -->
    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>

    <span>{{ copied ? 'Copiado! ✓' : props.label }}</span>
  </button>
</template>
