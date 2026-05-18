<script setup lang="ts">
import { ChevronRight, ChevronLeft, User, LogIn } from 'lucide-vue-next'
import type { ShippingAddress } from '~/composables/useCheckout'
import type { DeliveryMethod } from '~/composables/useCart'

const { cart } = useCart()
const { createCheckoutSession, loading } = useCheckout()
const { error: toastError } = useToast()
const user = useSupabaseUser()

const isGuest = computed(() => !user.value)

// Steps: 1=identificação(guest)/entrega(logado), 2=entrega, 3=endereço/pickup, 4=presente, 5=pagamento
// Para logados: steps 2-5 (sem identificação)
// Para convidados: steps 1-5
const TOTAL_STEPS = computed(() => isGuest.value ? 5 : 4)
const step = ref(1)

// Guest info
const guestInfo = reactive({
  name: '',
  email: '',
  cpf: '',
  phone: '',
})

const deliveryMethod = ref<DeliveryMethod>(cart.value.deliveryMethod)
const shippingAddress = ref<ShippingAddress>({
  street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: '',
})
const giftMessage = ref('')
const giftWrap    = ref(false)

// Step labels dinâmicos
const stepLabels = computed(() =>
  isGuest.value
    ? ['Identificação', 'Entrega', 'Endereço', 'Presente', 'Pagamento']
    : ['Entrega', 'Endereço', 'Presente', 'Pagamento'],
)

// Qual step real corresponde a qual conteúdo
function getStepContent() {
  if (isGuest.value) {
    // 1=guest, 2=delivery, 3=address, 4=gift, 5=payment
    return step.value
  } else {
    // 1=delivery, 2=address, 3=gift, 4=payment
    return step.value + 1
  }
}

const stepContent = computed(() => getStepContent())

function nextStep() {
  // Validação por step
  if (isGuest.value && step.value === 1) {
    if (!guestInfo.name.trim()) { toastError('Informe seu nome'); return }
    if (!guestInfo.email.trim() || !guestInfo.email.includes('@')) { toastError('Informe um e-mail válido'); return }
  }
  if (stepContent.value === 3 && deliveryMethod.value === 'shipping') {
    if (!shippingAddress.value.street || !shippingAddress.value.number || !shippingAddress.value.city) {
      toastError('Preencha o endereço completo')
      return
    }
  }
  if (step.value < TOTAL_STEPS.value) step.value++
}

function prevStep() {
  if (step.value > 1) step.value--
}

async function submit() {
  await createCheckoutSession({
    deliveryMethod: deliveryMethod.value,
    shippingAddress: deliveryMethod.value === 'shipping' ? shippingAddress.value : undefined,
    giftMessage: giftMessage.value || undefined,
    giftWrap: giftWrap.value,
    guestInfo: isGuest.value ? { ...guestInfo } : undefined,
  })
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <!-- Progress bar (mobile) -->
    <div class="md:hidden px-4 pt-4 pb-2">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs font-medium text-gray-500">Passo {{ step }} de {{ TOTAL_STEPS }}</p>
        <p class="text-xs font-semibold text-rose-600">{{ stepLabels[step - 1] }}</p>
      </div>
      <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-rose-500 rounded-full transition-all duration-300"
          :style="{ width: `${(step / TOTAL_STEPS) * 100}%` }"
          role="progressbar"
          :aria-valuenow="step"
          :aria-valuemax="TOTAL_STEPS"
        />
      </div>
    </div>

    <!-- Desktop step tabs -->
    <div class="hidden md:flex border-b border-gray-100">
      <button
        v-for="(label, i) in stepLabels"
        :key="i"
        class="flex-1 py-3 text-xs font-medium transition-colors"
        :class="step === i + 1
          ? 'text-rose-600 border-b-2 border-rose-500'
          : step > i + 1
            ? 'text-green-600'
            : 'text-gray-400'"
        @click="step > i + 1 ? step = i + 1 : undefined"
      >
        {{ step > i + 1 ? '✓ ' : '' }}{{ label }}
      </button>
    </div>

    <div class="p-4">

      <!-- STEP: Identificação (apenas convidados) -->
      <div v-if="isGuest && step === 1">
        <div class="flex items-center gap-2 mb-4">
          <User class="w-5 h-5 text-rose-500" />
          <h3 class="font-semibold text-gray-900">Seus Dados</h3>
        </div>

        <!-- Opção de login -->
        <div class="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-4 flex items-center justify-between gap-3">
          <p class="text-sm text-gray-600">Já tem conta? Faça login para comprar mais rápido.</p>
          <NuxtLink
            to="/login"
            class="flex items-center gap-1.5 text-rose-600 font-semibold text-sm whitespace-nowrap hover:text-rose-700"
          >
            <LogIn class="w-4 h-4" />
            Entrar
          </NuxtLink>
        </div>

        <div class="space-y-3">
          <AppInput
            v-model="guestInfo.name"
            label="Nome Completo"
            placeholder="Seu nome completo"
            autocomplete="name"
            required
          />
          <AppInput
            v-model="guestInfo.email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            autocomplete="email"
            required
          />
          <AppInput
            v-model="guestInfo.phone"
            label="Telefone / WhatsApp"
            type="tel"
            placeholder="(00) 00000-0000"
            autocomplete="tel"
          />
          <AppInput
            v-model="guestInfo.cpf"
            label="CPF"
            placeholder="000.000.000-00"
            inputmode="numeric"
          />
        </div>
        <p class="text-xs text-gray-400 mt-3">
          🔒 Seus dados são usados apenas para processar o pedido e enviar a confirmação.
        </p>
      </div>

      <!-- STEP: Método de entrega -->
      <div v-else-if="stepContent === 2">
        <h3 class="font-semibold text-gray-900 mb-4">Como deseja receber?</h3>
        <DeliveryMethodSelector v-model="deliveryMethod" />
      </div>

      <!-- STEP: Endereço ou Pickup -->
      <div v-else-if="stepContent === 3">
        <template v-if="deliveryMethod === 'pickup'">
          <h3 class="font-semibold text-gray-900 mb-4">Informações de Retirada</h3>
          <PickupInfo />
        </template>
        <template v-else>
          <h3 class="font-semibold text-gray-900 mb-4">Endereço de Entrega</h3>
          <div class="space-y-3">
            <AppInput v-model="shippingAddress.zip" label="CEP" placeholder="00000-000" inputmode="numeric" autocomplete="postal-code" required />
            <AppInput v-model="shippingAddress.street" label="Rua / Avenida" placeholder="Nome da rua" autocomplete="address-line1" required />
            <div class="grid grid-cols-2 gap-3">
              <AppInput v-model="shippingAddress.number" label="Número" placeholder="123" inputmode="numeric" required />
              <AppInput v-model="shippingAddress.complement" label="Complemento" placeholder="Apto, Bloco..." />
            </div>
            <AppInput v-model="shippingAddress.neighborhood" label="Bairro" placeholder="Nome do bairro" required />
            <div class="grid grid-cols-2 gap-3">
              <AppInput v-model="shippingAddress.city" label="Cidade" placeholder="São Paulo" autocomplete="address-level2" required />
              <AppInput v-model="shippingAddress.state" label="Estado" placeholder="SP" autocomplete="address-level1" required />
            </div>
          </div>
        </template>
      </div>

      <!-- STEP: Presente -->
      <div v-else-if="stepContent === 4">
        <h3 class="font-semibold text-gray-900 mb-4">Opções de Presente 🎁</h3>
        <div class="space-y-4">
          <label class="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:border-rose-200 transition-colors">
            <input v-model="giftWrap" type="checkbox" class="mt-0.5 w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-400" />
            <div>
              <p class="font-medium text-gray-800">Embalagem de Presente</p>
              <p class="text-sm text-gray-500">Seu pedido chegará em uma embalagem especial e elegante</p>
              <span class="inline-block mt-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">GRÁTIS</span>
            </div>
          </label>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="gift-message">
              Mensagem Personalizada <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="gift-message"
              v-model="giftMessage"
              rows="3"
              maxlength="200"
              placeholder="Escreva uma mensagem especial para acompanhar o presente..."
              class="w-full px-3 py-3 rounded-xl border border-gray-200 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
            <p class="text-xs text-gray-400 text-right mt-1">{{ giftMessage.length }}/200</p>
          </div>
        </div>
      </div>

      <!-- STEP: Pagamento (resumo antes de ir ao Stripe) -->
      <div v-else-if="stepContent === 5">
        <h3 class="font-semibold text-gray-900 mb-4">Confirmar Pedido</h3>

        <!-- Bandeiras aceitas -->
        <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex items-start gap-3">
          <span class="text-lg flex-shrink-0">💳</span>
          <div>
            <p class="text-sm font-medium text-blue-800 mb-1">Bandeiras aceitas</p>
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1 text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-medium">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" class="h-3 w-auto" loading="lazy" />
                Visa
              </span>
              <span class="inline-flex items-center gap-1 text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-medium">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" class="h-3 w-auto" loading="lazy" />
                Mastercard
              </span>
              <span class="inline-flex items-center gap-1 text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-medium">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png" alt="Amex" class="h-3 w-auto" loading="lazy" />
                Amex
              </span>
            </div>
            <p class="text-xs text-blue-600 mt-1.5">⚠️ Cartões Elo, Hipercard e débito não são aceitos no momento.</p>
          </div>
        </div>

        <!-- Resumo do comprador -->
        <div class="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
          <div v-if="isGuest">
            <p class="text-gray-500 text-xs uppercase tracking-wide mb-2">Comprador</p>
            <p class="font-medium text-gray-800">{{ guestInfo.name }}</p>
            <p class="text-gray-600">{{ guestInfo.email }}</p>
            <p v-if="guestInfo.phone" class="text-gray-600">{{ guestInfo.phone }}</p>
          </div>
          <div v-else>
            <p class="text-gray-500 text-xs uppercase tracking-wide mb-2">Conta</p>
            <p class="font-medium text-gray-800">{{ user?.email }}</p>
          </div>
        </div>

        <!-- Resumo da entrega -->
        <div class="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
          <p class="text-gray-500 text-xs uppercase tracking-wide mb-2">Entrega</p>
          <p class="font-medium text-gray-800">
            {{ deliveryMethod === 'pickup' ? '🏪 Retirada na Loja (Grátis)' : '🚚 Entrega em domicílio' }}
          </p>
          <template v-if="deliveryMethod === 'shipping' && shippingAddress.street">
            <p class="text-gray-600 mt-1">{{ shippingAddress.street }}, {{ shippingAddress.number }}</p>
            <p class="text-gray-600">{{ shippingAddress.city }}/{{ shippingAddress.state }}</p>
          </template>
        </div>

        <div class="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-gray-600">
          🔒 Você será redirecionado para o Stripe para inserir os dados do cartão com segurança.
        </div>
      </div>

      <!-- Botões de navegação -->
      <div class="flex gap-3 mt-6">
        <button
          v-if="step > 1"
          class="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 active:scale-[0.97] transition-all min-h-[48px]"
          @click="prevStep"
        >
          <ChevronLeft class="w-4 h-4" />
          Voltar
        </button>

        <button
          v-if="step < TOTAL_STEPS"
          class="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-3 rounded-xl min-h-[48px] hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all"
          @click="nextStep"
        >
          Próximo
          <ChevronRight class="w-4 h-4" />
        </button>

        <button
          v-else
          class="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 rounded-xl min-h-[48px] hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all disabled:opacity-60"
          :disabled="loading"
          @click="submit"
        >
          <span v-if="loading">Processando...</span>
          <span v-else>Ir para Pagamento 🔒</span>
        </button>
      </div>
    </div>
  </div>
</template>
