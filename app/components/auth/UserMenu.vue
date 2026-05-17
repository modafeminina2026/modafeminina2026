<script setup lang="ts">
import { User, ShoppingBag, CreditCard, Heart, LogOut, ChevronDown } from 'lucide-vue-next'

const { isLoggedIn, logout, fetchProfile } = useAuth()
const open = ref(false)

interface Profile { full_name?: string; email?: string }
const profile = ref<Profile | null>(null)

onMounted(async () => {
  if (isLoggedIn.value) {
    profile.value = await fetchProfile()
  }
})

const initials = computed(() => {
  const name = profile.value?.full_name ?? ''
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'U'
})

const menuLinks = [
  { to: '/perfil',          label: 'Meu Perfil',      icon: User },
  { to: '/perfil/pedidos',  label: 'Meus Pedidos',     icon: ShoppingBag },
  { to: '/perfil/cartoes',  label: 'Meus Cartões',     icon: CreditCard },
  { to: '/perfil/wishlist', label: 'Lista de Desejos', icon: Heart },
]

const route = useRoute()
watch(() => route.path, () => { open.value = false })
</script>

<template>
  <!-- Not logged in -->
  <div v-if="!isLoggedIn" class="flex items-center gap-2">
    <NuxtLink to="/login">
      <AppButton variant="outline" size="sm">Entrar</AppButton>
    </NuxtLink>
    <NuxtLink to="/registro" class="hidden sm:block">
      <AppButton variant="primary" size="sm">Criar Conta</AppButton>
    </NuxtLink>
  </div>

  <!-- Logged in — desktop dropdown -->
  <div v-else class="relative hidden md:block">
    <button
      class="flex items-center gap-2 h-11 px-3 rounded-lg hover:bg-rose-50 transition-colors"
      :aria-expanded="open"
      aria-haspopup="true"
      @click="open = !open"
    >
      <!-- Avatar -->
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
        {{ initials }}
      </div>
      <span class="text-sm font-medium text-gray-700 max-w-[100px] truncate">
        {{ profile?.full_name?.split(' ')[0] ?? 'Minha Conta' }}
      </span>
      <ChevronDown class="w-4 h-4 text-gray-400 transition-transform" :class="open ? 'rotate-180' : ''" aria-hidden="true" />
    </button>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="open"
        v-click-outside="() => open = false"
        class="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
        role="menu"
      >
        <!-- Profile header -->
        <div class="px-4 py-3 border-b border-gray-100">
          <p class="text-sm font-semibold text-gray-900 truncate">{{ profile?.full_name ?? 'Usuário' }}</p>
          <p class="text-xs text-gray-500 truncate">{{ profile?.email ?? '' }}</p>
        </div>

        <NuxtLink
          v-for="link in menuLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          role="menuitem"
        >
          <component :is="link.icon" class="w-4 h-4" aria-hidden="true" />
          {{ link.label }}
        </NuxtLink>

        <hr class="my-1 border-gray-100">
        <button
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          role="menuitem"
          @click="logout"
        >
          <LogOut class="w-4 h-4" aria-hidden="true" />
          Sair
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
