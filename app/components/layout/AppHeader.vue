<script setup lang="ts">
import { ShoppingBag, Heart, User, Menu } from 'lucide-vue-next'

const { cartCount } = useCart()
const { isLoggedIn, logout } = useAuth()
const sidebarOpen = ref(false)
const cartDrawerOpen = useState('cart-drawer-open', () => false)

const navLinks = [
  { label: 'Início', to: '/' },
  { label: 'Lingerie', to: '/categoria/lingerie' },
  { label: 'Perfumes', to: '/categoria/perfumes' },
  { label: 'Joias', to: '/categoria/joias' },
  { label: 'Maquiagens', to: '/categoria/maquiagens' },
]
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-rose-100 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-4">

      <!-- Hamburger (mobile) -->
      <button
        class="flex md:hidden items-center justify-center w-11 h-11 rounded-lg hover:bg-rose-50 text-gray-700 transition-colors"
        aria-label="Abrir menu"
        @click="sidebarOpen = true"
      >
        <Menu class="w-5 h-5" aria-hidden="true" />
      </button>

      <!-- Logo -->
      <NuxtLink to="/" class="flex-1 md:flex-none text-center md:text-left">
        <span class="font-display text-lg sm:text-xl font-bold bg-gradient-to-r from-rose-600 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
          Lover's Brasileiras
        </span>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-1" aria-label="Navegação principal">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          active-class="text-rose-600 bg-rose-50"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-1">
        <!-- Wishlist -->
        <NuxtLink
          to="/perfil/wishlist"
          class="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-colors"
          aria-label="Lista de desejos"
        >
          <Heart class="w-5 h-5" aria-hidden="true" />
        </NuxtLink>

        <!-- Cart -->
        <button
          class="relative flex items-center justify-center w-11 h-11 rounded-lg hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-colors"
          :aria-label="`Carrinho, ${cartCount} itens`"
          @click="cartDrawerOpen = true"
        >
          <ShoppingBag class="w-5 h-5" aria-hidden="true" />
          <span
            v-if="cartCount > 0"
            class="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-600 text-white text-[10px] font-bold rounded-full px-1"
            aria-hidden="true"
          >
            {{ cartCount > 99 ? '99+' : cartCount }}
          </span>
        </button>

        <!-- User -->
        <NuxtLink
          v-if="!isLoggedIn"
          to="/login"
          class="hidden sm:flex items-center justify-center w-11 h-11 rounded-lg hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-colors"
          aria-label="Entrar"
        >
          <User class="w-5 h-5" aria-hidden="true" />
        </NuxtLink>

        <div v-else class="hidden sm:block relative group">
          <button
            class="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-colors"
            aria-label="Menu do usuário"
          >
            <User class="w-5 h-5" aria-hidden="true" />
          </button>
          <!-- Dropdown -->
          <div class="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <NuxtLink to="/perfil" class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600">Meu Perfil</NuxtLink>
            <NuxtLink to="/perfil/pedidos" class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600">Meus Pedidos</NuxtLink>
            <NuxtLink to="/perfil/cartoes" class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600">Meus Cartões</NuxtLink>
            <NuxtLink to="/perfil/wishlist" class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600">Lista de Desejos</NuxtLink>
            <hr class="my-1 border-gray-100">
            <button class="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50" @click="logout">Sair</button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Sidebar -->
  <AppSidebar v-model="sidebarOpen" />
</template>
