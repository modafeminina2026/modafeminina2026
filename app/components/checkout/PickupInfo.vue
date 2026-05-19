<script setup lang="ts">
import { MapPin, Clock, Calendar, Info } from 'lucide-vue-next'

interface Props {
  pickupCode?: string | null
  pickupReadyBy?: string | null
  pickupStatus?: string | null
  showCode?: boolean // true after order is placed
}

const props = withDefaults(defineProps<Props>(), { showCode: false })

const { formatPickupDate, formatPickupCode, getPickupStatusLabel, getPickupStatusColor } = usePickup()

const estimatedDate = computed(() => {
  if (props.pickupReadyBy) return formatPickupDate(props.pickupReadyBy)
  const d = new Date()
  d.setDate(d.getDate() + 4) // rough estimate before order
  return formatPickupDate(d)
})
</script>

<template>
  <div class="rounded-xl border border-rose-100 bg-rose-50 p-4 space-y-3">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <MapPin class="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
      <p class="font-semibold text-rose-800">Retirada na Loja</p>
    </div>

    <!-- Pickup code (after order) -->
    <div v-if="props.showCode && props.pickupCode" class="bg-white rounded-xl p-4 text-center border border-rose-200">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Seu Código de Retirada</p>
      <p
        class="text-5xl font-bold tracking-[0.5em] text-rose-600 font-mono"
        aria-label="`Código de retirada: ${props.pickupCode}`"
      >
        {{ formatPickupCode(props.pickupCode) }}
      </p>
      <div class="mt-3 flex justify-center">
        <CopyButton :text="props.pickupCode" label="Copiar Código" />
      </div>
      <p class="text-xs text-gray-500 mt-3">Apresente este código na loja para retirar seu pedido</p>

      <!-- Status badge -->
      <div v-if="props.pickupStatus" class="mt-3 flex justify-center">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" :class="getPickupStatusColor(props.pickupStatus)">
          {{ getPickupStatusLabel(props.pickupStatus) }}
        </span>
      </div>
    </div>

    <!-- Info list -->
    <ul class="space-y-2 text-sm text-rose-900">
      <li class="flex items-start gap-2">
        <MapPin class="w-4 h-4 shrink-0 mt-0.5 text-rose-500" aria-hidden="true" />
        <span>R. Dep. João Sussumu Hirata, 721 — Vila Andrade, São Paulo/SP</span>
      </li>
      <li class="flex items-start gap-2">
        <Calendar class="w-4 h-4 shrink-0 mt-0.5 text-rose-500" aria-hidden="true" />
        <span>Disponível para retirada: <strong>{{ estimatedDate }}</strong></span>
      </li>
      <li class="flex items-start gap-2">
        <Clock class="w-4 h-4 shrink-0 mt-0.5 text-rose-500" aria-hidden="true" />
        <span>Seg–Sex: 9h–18h · Sáb: 9h–13h</span>
      </li>
      <li v-if="!props.showCode" class="flex items-start gap-2">
        <Info class="w-4 h-4 shrink-0 mt-0.5 text-rose-500" aria-hidden="true" />
        <span>Após o pagamento, você receberá um <strong>código de 4 dígitos</strong> para retirada</span>
      </li>
    </ul>
  </div>
</template>
