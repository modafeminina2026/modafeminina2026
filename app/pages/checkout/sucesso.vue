<script setup lang="ts">
import { CheckCircle, MapPin, Clock, Package, Copy, Check } from 'lucide-vue-next'

const route = useRoute()
const { clearCart } = useCart()
const { formatPickupCode, formatPickupDate } = usePickup()
const { playOrderComplete } = useSound()

const sessionId = route.query.session_id as string | undefined
const orderId = route.query.order_id as string | undefined
const pickupCodeParam = route.query.pickup_code as string | undefined
const orderNumberParam = route.query.order_number as string | undefined

// Pix: dados diretos da query string
const pixOrder = computed(() => {
  if (!orderId) return null
  return {
    id: orderId,
    order_number: orderNumberParam ?? null,
    pickup_code: pickupCodeParam ?? null,
    delivery_method: pickupCodeParam ? 'pickup' : 'shipping',
    total: null,
    subtotal: null,
    shipping_cost: null,
  }
})

// Stripe: buscar pelo session_id
const { data: stripeOrder, pending, error } = sessionId
  ? await useFetch(`/api/orders/by-session?session_id=${sessionId}`, { key: `order-${sessionId}` })
  : { data: ref(null), pending: ref(false), error: ref(null) }

const order = computed(() => pixOrder.value ?? stripeOrder.value)
const isPickup = computed(() => order.value?.delivery_method === 'pickup')

// Limpar carrinho e tocar som de celebração
onMounted(() => {
  clearCart()
  playOrderComplete()
})

// Copiar código
const copied = ref(false)
async function copyCode() {
  if (!order.value?.pickup_code) return
  try {
    await navigator.clipboard.writeText(order.value.pickup_code)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback silencioso
  }
}

const pickupReadyDate = computed(() => {
  if (!order.value?.pickup_ready_by) return null
  return formatPickupDate(order.value.pickup_ready_by)
})

useHead({
  title: 'Pedido Confirmado — Lover\'s Brasileiras',
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-lg">

      <!-- Loading -->
      <div v-if="pending" class="text-center py-16">
        <div class="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
        <p class="text-gray-500">Confirmando seu pedido...</p>
      </div>

      <!-- Erro -->
      <div v-else-if="error || !order" class="text-center py-16">
        <div class="text-5xl mb-4">😕</div>
        <h1 class="text-xl font-semibold text-gray-800 mb-2">Pedido não encontrado</h1>
        <p class="text-gray-500 mb-6 text-sm">
          Seu pagamento pode ter sido processado. Verifique seu e-mail ou entre em contato conosco.
        </p>
        <NuxtLink to="/" class="text-rose-500 font-semibold">Voltar ao início</NuxtLink>
      </div>

      <!-- Sucesso -->
      <template v-else>
        <!-- Ícone de sucesso -->
        <div class="text-center mb-6">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle class="w-12 h-12 text-green-500" />
          </div>
          <h1 class="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-1">
            Pedido Confirmado!
          </h1>
          <p class="text-gray-500 text-sm">
            Obrigada pela sua compra na Lover's Brasileiras
          </p>
          <p v-if="order.order_number" class="text-xs text-gray-400 mt-1">
            Pedido <span class="font-semibold text-gray-600">{{ order.order_number }}</span>
          </p>
        </div>

        <!-- Card de retirada -->
        <div v-if="isPickup && order.pickup_code" class="bg-white rounded-3xl shadow-xl p-6 mb-4">
          <div class="flex items-center gap-2 mb-4">
            <Package class="w-5 h-5 text-rose-500" />
            <h2 class="font-semibold text-gray-800">Retirada na Loja</h2>
          </div>

          <!-- Código em destaque -->
          <div class="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 rounded-2xl p-5 text-center mb-4">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Seu Código de Retirada</p>
            <div class="text-6xl font-mono font-bold text-rose-600 tracking-[0.3em] mb-4">
              {{ formatPickupCode(order.pickup_code) }}
            </div>
            <button
              class="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-[0.97] text-white font-semibold px-6 py-2.5 rounded-full transition-all min-h-[44px]"
              @click="copyCode"
            >
              <component :is="copied ? Check : Copy" class="w-4 h-4" />
              {{ copied ? 'Copiado!' : 'Copiar Código' }}
            </button>
          </div>

          <!-- Informações -->
          <div class="space-y-3 text-sm">
            <div v-if="pickupReadyDate" class="flex items-start gap-3">
              <Clock class="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <p class="font-medium text-gray-700">Pronto para retirada em</p>
                <p class="text-gray-600 capitalize">{{ pickupReadyDate }}</p>
                <p class="text-xs text-gray-400 mt-0.5">3 dias úteis após confirmação</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <MapPin class="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <p class="font-medium text-gray-700">Endereço da Loja</p>
                <p class="text-gray-600">R. Dep. João Sussumu Hirata, 721 — Vila Andrade</p>
                <p class="text-gray-600">São Paulo, SP — CEP 05715-010</p>
              </div>
            </div>
          </div>

          <div class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            <strong>Importante:</strong> Apresente este código ao retirar seu pedido. Guarde-o com segurança!
          </div>
        </div>

        <!-- Card de entrega (shipping) -->
        <div v-else class="bg-white rounded-3xl shadow-xl p-6 mb-4">
          <div class="flex items-center gap-2 mb-3">
            <Package class="w-5 h-5 text-rose-500" />
            <h2 class="font-semibold text-gray-800">Entrega em Domicílio</h2>
          </div>
          <p class="text-gray-600 text-sm">
            Você receberá um e-mail com o código de rastreamento assim que seu pedido for despachado.
          </p>
          <p class="text-gray-500 text-xs mt-2">Prazo estimado: 5 a 10 dias úteis</p>
        </div>

        <!-- Resumo do valor -->
        <div class="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Subtotal</span>
            <span>{{ Number(order.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</span>
          </div>
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Frete</span>
            <span :class="Number(order.shipping_cost) === 0 ? 'text-green-600 font-medium' : ''">
              {{ Number(order.shipping_cost) === 0 ? 'GRÁTIS' : Number(order.shipping_cost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
            </span>
          </div>
          <div class="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2">
            <span>Total pago</span>
            <span>{{ Number(order.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</span>
          </div>
        </div>

        <!-- Ações -->
        <div class="space-y-3">
          <NuxtLink
            to="/produtos"
            class="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-3 rounded-xl min-h-[48px] flex items-center justify-center hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all"
          >
            Continuar Comprando
          </NuxtLink>
          <NuxtLink
            to="/"
            class="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2 min-h-[44px] flex items-center justify-center"
          >
            Voltar para o Início
          </NuxtLink>
        </div>
      </template>

    </div>
  </div>
</template>
