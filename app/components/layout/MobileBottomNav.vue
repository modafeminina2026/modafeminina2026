<script setup lang="ts">
import { Home, Grid3X3, ShoppingBag, Heart, User } from 'lucide-vue-next'

const { cartCount } = useCart()
const route = useRoute()
const cartDrawerOpen = useState('cart-drawer-open', () => false)

const tabs = [
  { label: 'Início',     to: '/',               icon: Home,        isCart: false },
  { label: 'Categorias', to: '/produtos',        icon: Grid3X3,     isCart: false },
  { label: 'Carrinho',   to: null,               icon: ShoppingBag, isCart: true  },
  { label: 'Desejos',    to: '/perfil/wishlist', icon: Heart,       isCart: false },
  { label: 'Perfil',     to: '/perfil',          icon: User,        isCart: false },
]

function isActive(tab: typeof tabs[0]) {
  if (tab.isCart) return cartDrawerOpen.value
  if (tab.to === '/') return route.path === '/'
  return route.path.startsWith(tab.to!)
}

function handleTab(tab: typeof tabs[0]) {
  if (tab.isCart) {
    cartDrawerOpen.value = true
  }
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-white border-t border-gray-200 pb-safe"
    aria-label="Navegação inferior"
  >
    <div class="flex items-stretch h-16">
      <template v-for="tab in tabs" :key="tab.label">
        <!-- Cart button -->
        <button
          v-if="tab.isCart"
          class="relative flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0 transition-colors"
          :class="isActive(tab) ? 'text-rose-600' : 'text-gray-500'"
          :aria-label="`Carrinho, ${cartCount} itens`"
          @click="handleTab(tab)"
        >
          <div class="relative">
            <component :is="tab.icon" class="w-5 h-5" aria-hidden="true" />
            <span
              v-if="cartCount > 0"
              class="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-rose-600 text-white text-[9px] font-bold rounded-full px-0.5"
              aria-hidden="true"
            >
              {{ cartCount > 9 ? '9+' : cartCount }}
            </span>
          </div>
          <span class="text-[10px] font-medium truncate">{{ tab.label }}</span>
          <span
            v-if="isActive(tab)"
            class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-rose-600 rounded-full"
            aria-hidden="true"
          />
        </button>

        <!-- Regular nav link -->
        <NuxtLink
          v-else
          :to="tab.to!"
          class="relative flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0 transition-colors"
          :class="isActive(tab) ? 'text-rose-600' : 'text-gray-500'"
          :aria-label="tab.label"
          :aria-current="isActive(tab) ? 'page' : undefined"
        >
          <div class="relative">
            <component :is="tab.icon" class="w-5 h-5" aria-hidden="true" />
          </div>
          <span class="text-[10px] font-medium truncate">{{ tab.label }}</span>
          <span
            v-if="isActive(tab)"
            class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-rose-600 rounded-full"
            aria-hidden="true"
          />
        </NuxtLink>
      </template>
    </div>
  </nav>
</template>
