<script setup lang="ts">
import { Home, Search, ShoppingBag, ArrowLeft } from 'lucide-vue-next'

useHead({
  title: 'Página Não Encontrada — Lover\'s Brasileiras',
  meta: [
    { name: 'description', content: 'A página que você procura não foi encontrada.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/produtos?search=${encodeURIComponent(searchQuery.value)}`)
  }
}

const suggestions = [
  { to: '/produtos', label: 'Ver Todos os Produtos', icon: ShoppingBag, isComponent: true },
  { to: '/categoria/lingerie', label: 'Lingerie', icon: '👙', isComponent: false },
  { to: '/categoria/perfumes', label: 'Perfumes', icon: '🌸', isComponent: false },
  { to: '/categoria/joias', label: 'Joias', icon: '💍', isComponent: false },
  { to: '/categoria/maquiagens', label: 'Maquiagens', icon: '💄', isComponent: false },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-lg text-center">
      <!-- Ilustração 404 -->
      <div class="mb-6">
        <div class="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-purple-300 select-none">
          404
        </div>
        <div class="text-4xl mb-4">💔</div>
      </div>

      <!-- Mensagem -->
      <h1 class="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-3">
        Página Não Encontrada
      </h1>
      <p class="text-gray-600 mb-2">
        Ops! A página que você procura não existe ou foi movida.
      </p>
      <p class="text-sm text-gray-500 mb-8">
        Caminho: <code class="bg-gray-100 px-2 py-1 rounded text-xs">{{ route.path }}</code>
      </p>

      <!-- Busca rápida -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 class="font-semibold text-gray-800 mb-3 text-sm">Que tal fazer uma busca?</h2>
        <form @submit.prevent="handleSearch" class="flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar produtos..."
            class="flex-1 h-12 px-4 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
          >
          <button
            type="submit"
            class="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 rounded-xl min-h-[48px] min-w-[48px] flex items-center justify-center hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all"
            aria-label="Buscar"
          >
            <Search class="w-5 h-5" />
          </button>
        </form>
      </div>

      <!-- Sugestões -->
      <div class="bg-white rounded-2xl shadow-lg p-5 mb-6">
        <h2 class="font-semibold text-gray-800 mb-3 text-sm">Ou explore nossas categorias:</h2>
        <div class="space-y-2">
          <NuxtLink
            v-for="suggestion in suggestions"
            :key="suggestion.to"
            :to="suggestion.to"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 active:bg-rose-100 transition-colors min-h-[48px] text-left"
          >
            <component v-if="suggestion.isComponent" :is="suggestion.icon" class="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span v-else class="text-xl flex-shrink-0">{{ suggestion.icon }}</span>
            <span class="text-gray-700 font-medium text-sm">{{ suggestion.label }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Ações principais -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          class="flex-1 bg-white text-gray-700 font-semibold py-3 px-6 rounded-xl min-h-[48px] flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 active:scale-[0.97] transition-all"
          @click="router.back()"
        >
          <ArrowLeft class="w-4 h-4" />
          Voltar
        </button>
        <NuxtLink
          to="/"
          class="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl min-h-[48px] flex items-center justify-center gap-2 hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all"
        >
          <Home class="w-4 h-4" />
          Ir para o Início
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
