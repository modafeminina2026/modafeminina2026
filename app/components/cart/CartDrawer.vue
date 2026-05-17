<script setup lang="ts">
import { ShoppingBag, X, ArrowRight } from 'lucide-vue-next'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const { cart, cartCount, subtotal, shippingCost, total } = useCart()

function close() { emit('update:modelValue', false) }

// Close on ESC
onMounted(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})

watch(() => props.modelValue, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-overlay">
      <div v-if="props.modelValue" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" aria-hidden="true" @click="close" />

        <!-- Panel -->
        <Transition name="drawer-panel">
          <div
            v-if="props.modelValue"
            class="relative z-10 flex flex-col bg-white w-full sm:w-[400px] h-full shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Carrinho de compras"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <ShoppingBag class="w-5 h-5 text-rose-600" aria-hidden="true" />
                <h2 class="font-semibold text-gray-900">Carrinho</h2>
                <span v-if="cartCount > 0" class="text-sm text-gray-500">({{ cartCount }})</span>
              </div>
              <button
                class="flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Fechar carrinho"
                @click="close"
              >
                <X class="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <!-- Empty state -->
            <div v-if="cart.items.length === 0" class="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <ShoppingBag class="w-16 h-16 text-gray-200" aria-hidden="true" />
              <div>
                <p class="font-medium text-gray-700">Seu carrinho está vazio</p>
                <p class="text-sm text-gray-500 mt-1">Adicione produtos para continuar</p>
              </div>
              <AppButton variant="outline" @click="close">Continuar Comprando</AppButton>
            </div>

            <!-- Items -->
            <div v-else class="flex-1 overflow-y-auto px-4 divide-y divide-gray-100">
              <CartItem v-for="item in cart.items" :key="item.id" :item="item" />
            </div>

            <!-- Footer -->
            <div v-if="cart.items.length > 0" class="border-t border-gray-100 p-4 space-y-3">
              <div class="space-y-1.5 text-sm">
                <div class="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {{ subtotal.toFixed(2).replace('.', ',') }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span :class="shippingCost === 0 ? 'text-green-600 font-medium' : ''">
                    {{ shippingCost === 0 ? 'GRÁTIS' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}` }}
                  </span>
                </div>
                <div class="flex justify-between font-bold text-base text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span class="text-rose-600">R$ {{ total.toFixed(2).replace('.', ',') }}</span>
                </div>
              </div>

              <NuxtLink to="/checkout" @click="close">
                <AppButton variant="primary" full-width size="lg" :icon-right="ArrowRight">
                  Finalizar Compra
                </AppButton>
              </NuxtLink>

              <button
                class="w-full text-sm text-gray-500 hover:text-rose-600 transition-colors py-1"
                @click="close"
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay-enter-active, .drawer-overlay-leave-active { transition: opacity 0.25s ease; }
.drawer-overlay-enter-from, .drawer-overlay-leave-to { opacity: 0; }
.drawer-panel-enter-active, .drawer-panel-leave-active { transition: transform 0.25s ease; }
.drawer-panel-enter-from, .drawer-panel-leave-to { transform: translateX(100%); }
</style>
