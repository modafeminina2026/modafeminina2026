<script setup lang="ts">
import { X, Home, ShoppingBag, Heart, User, LogOut, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const { isLoggedIn, logout } = useAuth()

function close() { emit('update:modelValue', false) }

const categories = [
  { label: 'Lingerie', to: '/categoria/lingerie', emoji: '👙' },
  { label: 'Perfumes', to: '/categoria/perfumes', emoji: '🌸' },
  { label: 'Joias', to: '/categoria/joias', emoji: '💎' },
  { label: 'Maquiagens', to: '/categoria/maquiagens', emoji: '💄' },
]

// Close on route change
const route = useRoute()
watch(() => route.path, close)

// Close on ESC
onMounted(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sidebar-overlay">
      <div v-if="props.modelValue" class="fixed inset-0 z-50 md:hidden">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" aria-hidden="true" @click="close" />

        <!-- Panel -->
        <Transition name="sidebar-panel">
          <div
            v-if="props.modelValue"
            class="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-4 border-b border-rose-100">
              <span class="font-display text-lg font-bold bg-gradient-to-r from-rose-600 to-purple-500 bg-clip-text text-transparent">
                Lover's Brasileiras
              </span>
              <button
                class="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Fechar menu"
                @click="close"
              >
                <X class="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <!-- Nav -->
            <nav class="flex-1 overflow-y-auto py-4 px-2" aria-label="Menu lateral">
              <NuxtLink to="/" class="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-rose-50 hover:text-rose-600 font-medium">
                <Home class="w-5 h-5" aria-hidden="true" /> Início
              </NuxtLink>

              <p class="px-3 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categorias</p>

              <NuxtLink
                v-for="cat in categories"
                :key="cat.to"
                :to="cat.to"
                class="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-rose-50 hover:text-rose-600"
              >
                <span class="text-lg" aria-hidden="true">{{ cat.emoji }}</span>
                <span class="font-medium">{{ cat.label }}</span>
                <ChevronRight class="w-4 h-4 ml-auto text-gray-400" aria-hidden="true" />
              </NuxtLink>

              <hr class="my-3 border-gray-100">

              <template v-if="isLoggedIn">
                <NuxtLink to="/perfil" class="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-rose-50 hover:text-rose-600">
                  <User class="w-5 h-5" aria-hidden="true" /> Meu Perfil
                </NuxtLink>
                <NuxtLink to="/perfil/pedidos" class="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-rose-50 hover:text-rose-600">
                  <ShoppingBag class="w-5 h-5" aria-hidden="true" /> Meus Pedidos
                </NuxtLink>
                <NuxtLink to="/perfil/wishlist" class="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-rose-50 hover:text-rose-600">
                  <Heart class="w-5 h-5" aria-hidden="true" /> Lista de Desejos
                </NuxtLink>
                <button
                  class="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50"
                  @click="logout"
                >
                  <LogOut class="w-5 h-5" aria-hidden="true" /> Sair
                </button>
              </template>
              <template v-else>
                <NuxtLink to="/login" class="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-rose-50 hover:text-rose-600">
                  <User class="w-5 h-5" aria-hidden="true" /> Entrar
                </NuxtLink>
              </template>
            </nav>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sidebar-overlay-enter-active, .sidebar-overlay-leave-active { transition: opacity 0.2s ease; }
.sidebar-overlay-enter-from, .sidebar-overlay-leave-to { opacity: 0; }
.sidebar-panel-enter-active, .sidebar-panel-leave-active { transition: transform 0.25s ease; }
.sidebar-panel-enter-from, .sidebar-panel-leave-to { transform: translateX(-100%); }
</style>
