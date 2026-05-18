<script setup lang="ts">
import { Copy, Check, RefreshCw, CheckCircle, Clock } from 'lucide-vue-next'

const props = defineProps<{
  paymentId: number
  qrCode: string
  qrCodeBase64: string
  total: number
}>()

const emit = defineEmits<{
  paid: [orderId: string, orderNumber: string, pickupCode: string | null]
  expired: []
}>()

const { success: toastSuccess } = useToast()
const { playOrderComplete, playNotification } = useSound()

const copied = ref(false)
const status = ref<'pending' | 'approved' | 'expired'>('pending')
const timeLeft = ref(30 * 60) // 30 minutos
const checking = ref(false)

// Copiar código Pix
async function copyCode() {
  await navigator.clipboard.writeText(props.qrCode)
  copied.value = true
  toastSuccess('Código Pix copiado! 📋')
  playNotification()
  setTimeout(() => { copied.value = false }, 3000)
}

// Verificar status do pagamento
async function checkStatus() {
  if (checking.value || status.value !== 'pending') return
  checking.value = true
  try {
    const result = await $fetch<{
      status: string
      order_id?: string
      order_number?: string
      pickup_code?: string | null
    }>(`/api/pix/status?payment_id=${props.paymentId}`)

    if (result.status === 'approved') {
      status.value = 'approved'
      playOrderComplete()
      emit('paid', result.order_id!, result.order_number!, result.pickup_code ?? null)
    }
  } catch { /* silently fail */ }
  finally { checking.value = false }
}

// Polling a cada 5 segundos
let pollInterval: ReturnType<typeof setInterval>
let countdownInterval: ReturnType<typeof setInterval>

onMounted(() => {
  // Poll status
  pollInterval = setInterval(checkStatus, 5000)

  // Countdown
  countdownInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      status.value = 'expired'
      clearInterval(pollInterval)
      clearInterval(countdownInterval)
      emit('expired')
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(pollInterval)
  clearInterval(countdownInterval)
})

const timeFormatted = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

function formatPrice(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Aprovado -->
    <div v-if="status === 'approved'" class="text-center py-8">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle class="w-10 h-10 text-green-500" />
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">Pix confirmado! 🎉</h3>
      <p class="text-gray-500 text-sm">Seu pagamento foi aprovado. Redirecionando...</p>
    </div>

    <!-- Expirado -->
    <div v-else-if="status === 'expired'" class="text-center py-8">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <Clock class="w-10 h-10 text-red-400" />
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">QR Code expirado</h3>
      <p class="text-gray-500 text-sm mb-4">O tempo para pagamento expirou. Tente novamente.</p>
    </div>

    <!-- QR Code ativo -->
    <template v-else>
      <!-- Header -->
      <div class="text-center">
        <div class="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-3">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span class="text-sm font-medium text-green-700">Aguardando pagamento</span>
        </div>
        <p class="text-2xl font-bold text-gray-900">{{ formatPrice(total) }}</p>
        <p class="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
          <Clock class="w-3 h-3" />
          Expira em <span class="font-mono font-bold text-rose-500 ml-1">{{ timeFormatted }}</span>
        </p>
      </div>

      <!-- QR Code image -->
      <div class="flex justify-center">
        <div class="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm">
          <img
            :src="`data:image/png;base64,${qrCodeBase64}`"
            alt="QR Code Pix"
            class="w-48 h-48 md:w-56 md:h-56"
          />
        </div>
      </div>

      <!-- Instruções -->
      <div class="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1.5">
        <p class="font-semibold text-gray-800 mb-2">Como pagar:</p>
        <p>1. Abra o app do seu banco</p>
        <p>2. Escolha pagar via <strong>Pix</strong></p>
        <p>3. Escaneie o QR Code ou use o código abaixo</p>
      </div>

      <!-- Copia e cola -->
      <div>
        <p class="text-xs text-gray-500 mb-1.5 font-medium">Pix Copia e Cola:</p>
        <div class="flex gap-2">
          <div class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-600 font-mono truncate">
            {{ qrCode.slice(0, 40) }}...
          </div>
          <button
            class="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all min-h-[44px]"
            :class="copied ? 'bg-green-500 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white active:scale-[0.97]'"
            @click="copyCode"
          >
            <component :is="copied ? Check : Copy" class="w-4 h-4" />
            {{ copied ? 'Copiado!' : 'Copiar' }}
          </button>
        </div>
      </div>

      <!-- Verificar manualmente -->
      <button
        class="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-all min-h-[48px]"
        :disabled="checking"
        @click="checkStatus"
      >
        <RefreshCw class="w-4 h-4" :class="checking ? 'animate-spin' : ''" />
        {{ checking ? 'Verificando...' : 'Já paguei — verificar' }}
      </button>
    </template>
  </div>
</template>
