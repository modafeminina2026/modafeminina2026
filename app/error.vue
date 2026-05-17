<script setup lang="ts">
import { AlertTriangle, Home, RefreshCw } from 'lucide-vue-next'

interface ErrorProps {
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
    stack?: string
  }
}

const props = defineProps<ErrorProps>()

const isDev = import.meta.dev

const statusCode = computed(() => props.error?.statusCode ?? 500)
const statusMessage = computed(() => props.error?.statusMessage ?? 'Erro Interno')
const message = computed(() => props.error?.message ?? 'Algo deu errado. Por favor, tente novamente.')

const errorMessages: Record<number, { title: string; desc: string; emoji: string }> = {
  400: {
    title: 'Requisição Inválida',
    desc: 'Os dados enviados não são válidos. Verifique e tente novamente.',
    emoji: '⚠️',
  },
  401: {
    title: 'Não Autorizado',
    desc: 'Você precisa fazer login para acessar esta página.',
    emoji: '🔒',
  },
  403: {
    title: 'Acesso Negado',
    desc: 'Você não tem permissão para acessar este recurso.',
    emoji: '🚫',
  },
  404: {
    title: 'Página Não Encontrada',
    desc: 'A página que você procura não existe ou foi movida.',
    emoji: '🔍',
  },
  500: {
    title: 'Erro no Servidor',
    desc: 'Algo deu errado do nosso lado. Estamos trabalhando para resolver.',
    emoji: '💔',
  },
  503: {
    title: 'Serviço Indisponível',
    desc: 'O serviço está temporariamente indisponível. Tente novamente em alguns instantes.',
    emoji: '🔧',
  },
}

const errorInfo = computed(() => errorMessages[statusCode.value] ?? errorMessages[500])

function handleError() {
  clearError({ redirect: '/' })
}

function reload() {
  window.location.reload()
}

useHead({
  title: `${statusCode.value} — ${errorInfo.value.title}`,
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-lg">
      <!-- Ícone de erro -->
      <div class="text-center mb-6">
        <div class="text-6xl mb-4">{{ errorInfo.emoji }}</div>
        <div class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-400 mb-2">
          {{ statusCode }}
        </div>
        <h1 class="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-2">
          {{ errorInfo.title }}
        </h1>
        <p class="text-gray-600 text-sm md:text-base">
          {{ errorInfo.desc }}
        </p>
      </div>

      <!-- Card de detalhes (apenas em dev) -->
      <div v-if="isDev && message" class="bg-white rounded-2xl shadow-lg p-5 mb-6">
        <div class="flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 text-sm mb-1">Detalhes do Erro (Dev Mode)</p>
            <p class="text-xs text-gray-600 break-words">{{ message }}</p>
            <details v-if="error.stack" class="mt-2">
              <summary class="text-xs text-rose-500 cursor-pointer hover:text-rose-600">Ver Stack Trace</summary>
              <pre class="mt-2 text-xs text-gray-500 overflow-x-auto bg-gray-50 p-2 rounded">{{ error.stack }}</pre>
            </details>
          </div>
        </div>
      </div>

      <!-- Sugestões de ação -->
      <div class="bg-white rounded-2xl shadow-lg p-5 mb-6">
        <h2 class="font-semibold text-gray-800 mb-3 text-sm">O que você pode fazer:</h2>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-start gap-2">
            <span class="text-rose-400 mt-0.5">•</span>
            <span>Verifique se o endereço está correto</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-rose-400 mt-0.5">•</span>
            <span>Tente recarregar a página</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-rose-400 mt-0.5">•</span>
            <span>Volte para a página inicial e navegue novamente</span>
          </li>
          <li v-if="statusCode >= 500" class="flex items-start gap-2">
            <span class="text-rose-400 mt-0.5">•</span>
            <span>Se o problema persistir, entre em contato conosco</span>
          </li>
        </ul>
      </div>

      <!-- Ações -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          class="flex-1 bg-white text-gray-700 font-semibold py-3 px-6 rounded-xl min-h-[48px] flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 active:scale-[0.97] transition-all"
          @click="reload"
        >
          <RefreshCw class="w-4 h-4" />
          Recarregar
        </button>
        <button
          class="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl min-h-[48px] flex items-center justify-center gap-2 hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all"
          @click="handleError"
        >
          <Home class="w-4 h-4" />
          Ir para o Início
        </button>
      </div>

      <!-- Link de contato -->
      <div class="text-center mt-6">
        <p class="text-xs text-gray-500 mb-2">Precisa de ajuda?</p>
        <a
          href="mailto:contato@loversbrasileiras.com.br"
          class="text-sm text-rose-500 hover:text-rose-600 font-medium"
        >
          contato@loversbrasileiras.com.br
        </a>
      </div>
    </div>
  </div>
</template>
