<script setup lang="ts">
import { Menu, Bell, ExternalLink } from 'lucide-vue-next'

defineEmits<{ toggleSidebar: [] }>()

const route = useRoute()

// Build breadcrumb from route path
const breadcrumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  const labels: Record<string, string> = {
    admin: 'Admin',
    produtos: 'Produtos',
    pedidos: 'Pedidos',
    usuarios: 'Usuários',
    galeria: 'Galeria',
    logs: 'Logs',
    configuracoes: 'Configurações',
    novo: 'Novo',
  }
  return parts.map((part, i) => ({
    label: labels[part] ?? part,
    to: '/' + parts.slice(0, i + 1).join('/'),
    isLast: i === parts.length - 1,
  }))
})
</script>

<template>
  <header class="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-4 sticky top-0 z-30">
    <!-- Hamburger (mobile) -->
    <button
      class="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Abrir menu"
      @click="$emit('toggleSidebar')"
    >
      <Menu class="w-5 h-5 text-gray-400" />
    </button>

    <!-- Breadcrumb -->
    <nav class="flex items-center gap-1.5 text-sm flex-1 min-w-0 overflow-hidden">
      <template v-for="(crumb, i) in breadcrumbs" :key="crumb.to">
        <span v-if="i > 0" class="text-gray-600">/</span>
        <NuxtLink
          v-if="!crumb.isLast"
          :to="crumb.to"
          class="text-gray-400 hover:text-gray-200 transition-colors truncate"
        >
          {{ crumb.label }}
        </NuxtLink>
        <span v-else class="text-gray-200 font-medium truncate">{{ crumb.label }}</span>
      </template>
    </nav>

    <!-- Actions -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- View site -->
      <a
        href="/"
        target="_blank"
        class="p-2 rounded-lg hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Ver site"
        title="Ver site"
      >
        <ExternalLink class="w-4 h-4 text-gray-400" />
      </a>

      <!-- Notifications (placeholder) -->
      <button
        class="p-2 rounded-lg hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center relative"
        aria-label="Notificações"
      >
        <Bell class="w-4 h-4 text-gray-400" />
      </button>
    </div>
  </header>
</template>
