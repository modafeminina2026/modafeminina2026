<script setup lang="ts">
import { CreditCard, Trash2, Star } from 'lucide-vue-next'
import type { SavedCard } from '~/composables/useCheckout'

interface Props {
  modelValue?: string | null // selected card id
  cards: SavedCard[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), { loading: false, modelValue: null })
const emit = defineEmits<{
  'update:modelValue': [id: string | null]
  remove: [id: string]
  setDefault: [id: string]
}>()

const confirmRemoveId = ref<string | null>(null)

const BRAND_LABELS: Record<string, string> = {
  visa: 'Visa', mastercard: 'Mastercard', elo: 'Elo',
  amex: 'Amex', hipercard: 'Hipercard',
}

function brandLabel(brand: string) {
  return BRAND_LABELS[brand.toLowerCase()] ?? brand
}

function cardTypeLabel(type: string) {
  return type === 'debit' ? 'Débito' : 'Crédito'
}
</script>

<template>
  <div class="space-y-3">
    <!-- Skeleton -->
    <template v-if="props.loading">
      <div v-for="n in 2" :key="n" class="h-20 rounded-xl bg-gray-100 animate-pulse" />
    </template>

    <!-- Empty -->
    <div v-else-if="!props.cards.length" class="text-center py-8 text-gray-500">
      <CreditCard class="w-10 h-10 mx-auto mb-2 text-gray-300" aria-hidden="true" />
      <p class="text-sm">Nenhum cartão salvo</p>
    </div>

    <!-- Cards list -->
    <template v-else>
      <div
        v-for="card in props.cards"
        :key="card.id"
        class="relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.99]"
        :class="props.modelValue === card.id
          ? 'border-rose-500 bg-rose-50'
          : 'border-gray-200 bg-white hover:border-rose-200'"
        role="radio"
        :aria-checked="props.modelValue === card.id"
        tabindex="0"
        @click="emit('update:modelValue', card.id)"
        @keydown.enter="emit('update:modelValue', card.id)"
        @keydown.space.prevent="emit('update:modelValue', card.id)"
      >
        <!-- Radio indicator -->
        <div
          class="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center"
          :class="props.modelValue === card.id ? 'border-rose-500' : 'border-gray-300'"
          aria-hidden="true"
        >
          <div v-if="props.modelValue === card.id" class="w-2.5 h-2.5 rounded-full bg-rose-500" />
        </div>

        <!-- Card info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-sm text-gray-900">{{ brandLabel(card.card_brand) }}</span>
            <AppBadge :variant="card.card_type === 'debit' ? 'purple' : 'rose'" size="sm">
              {{ cardTypeLabel(card.card_type) }}
            </AppBadge>
            <AppBadge v-if="card.is_default" variant="gray" size="sm">
              <Star class="w-2.5 h-2.5 inline mr-0.5" aria-hidden="true" />Padrão
            </AppBadge>
          </div>
          <p class="text-sm text-gray-600 mt-0.5">
            •••• •••• •••• {{ card.card_last4 }}
          </p>
          <p class="text-xs text-gray-400">
            {{ card.cardholder_name }} · {{ String(card.card_exp_month).padStart(2, '0') }}/{{ card.card_exp_year }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 shrink-0">
          <button
            v-if="!card.is_default"
            class="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors"
            :aria-label="`Definir ${brandLabel(card.card_brand)} como padrão`"
            @click.stop="emit('setDefault', card.id)"
          >
            <Star class="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            class="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            :aria-label="`Remover cartão ${brandLabel(card.card_brand)} final ${card.card_last4}`"
            @click.stop="confirmRemoveId = card.id"
          >
            <Trash2 class="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </template>

    <!-- Add new card button -->
    <NuxtLink
      to="/checkout"
      class="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-rose-300 hover:text-rose-600 transition-colors"
    >
      <CreditCard class="w-4 h-4" aria-hidden="true" />
      Adicionar Novo Cartão
    </NuxtLink>

    <!-- Confirm remove modal -->
    <AppModal v-model="confirmRemoveId" title="Remover Cartão" bottom-sheet>
      <div class="p-4 pb-6">
        <p class="text-sm text-gray-600 mb-5">Tem certeza que deseja remover este cartão? Esta ação não pode ser desfeita.</p>
        <div class="flex gap-3">
          <AppButton variant="outline" full-width @click="confirmRemoveId = null">Cancelar</AppButton>
          <AppButton
            variant="danger"
            full-width
            @click="() => { if (confirmRemoveId) { emit('remove', confirmRemoveId); confirmRemoveId = null } }"
          >
            Remover
          </AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>
