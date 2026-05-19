<script setup lang="ts">
import { Truck, MapPin } from 'lucide-vue-next'
import type { DeliveryMethod } from '~/composables/useCart'

interface Props {
  modelValue: DeliveryMethod
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: DeliveryMethod] }>()

const { setDeliveryMethod } = useCart()

function select(method: DeliveryMethod) {
  setDeliveryMethod(method)
  emit('update:modelValue', method)
}
</script>

<template>
  <div class="space-y-3" role="radiogroup" aria-label="Método de entrega">
    <!-- Shipping -->
    <button
      class="w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all active:scale-[0.99]"
      :class="props.modelValue === 'shipping'
        ? 'border-rose-500 bg-rose-50'
        : 'border-gray-200 bg-white hover:border-rose-200'"
      role="radio"
      :aria-checked="props.modelValue === 'shipping'"
      @click="select('shipping')"
    >
      <div
        class="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
        :class="props.modelValue === 'shipping' ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500'"
      >
        <Truck class="w-5 h-5" aria-hidden="true" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-gray-900">📦 Entrega</p>
        <p class="text-sm text-gray-500 mt-0.5">Frete calculado no próximo passo</p>
      </div>
      <div
        class="w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center"
        :class="props.modelValue === 'shipping' ? 'border-rose-500' : 'border-gray-300'"
        aria-hidden="true"
      >
        <div v-if="props.modelValue === 'shipping'" class="w-2.5 h-2.5 rounded-full bg-rose-500" />
      </div>
    </button>

    <!-- Pickup -->
    <button
      class="w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all active:scale-[0.99]"
      :class="props.modelValue === 'pickup'
        ? 'border-rose-500 bg-rose-50'
        : 'border-gray-200 bg-white hover:border-rose-200'"
      role="radio"
      :aria-checked="props.modelValue === 'pickup'"
      @click="select('pickup')"
    >
      <div
        class="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
        :class="props.modelValue === 'pickup' ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500'"
      >
        <MapPin class="w-5 h-5" aria-hidden="true" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <p class="font-semibold text-gray-900">🏪 Retirar na Loja</p>
          <AppBadge variant="green" size="sm">GRÁTIS</AppBadge>
        </div>
        <p class="text-sm text-gray-500 mt-0.5">Disponível em até 3 dias úteis</p>
        <p class="text-xs text-gray-400 mt-1">R. Dep. João Sussumu Hirata, 721 — Vila Andrade, São Paulo/SP</p>
      </div>
      <div
        class="w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center"
        :class="props.modelValue === 'pickup' ? 'border-rose-500' : 'border-gray-300'"
        aria-hidden="true"
      >
        <div v-if="props.modelValue === 'pickup'" class="w-2.5 h-2.5 rounded-full bg-rose-500" />
      </div>
    </button>
  </div>
</template>
