<script setup lang="ts">
import { X, LayoutDashboard, Package, ShoppingBag, ClipboardList, Settings, LogOut } from 'lucide-vue-next'

defineEmits<{ close: [] }>()

const route = useRoute()
const { logout, adminUser } = useAdminAuth()

const navLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/produtos', icon: Package, label: 'Produtos' },
  { to: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/admin/logs', icon: ClipboardList, label: 'Logs de Atividade' },
  { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
]

function isActive(link: { to: string; exact?: boolean }) {
  if (link.exact) return route.path === link.to
  return route.path.startsWith(link.to)
}
</script>

<template>
  <aside class="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col fixed top-0 left-0 h-full z-40">
    <!-- Logo -->
    <div class="h-16 flex items-center justify-between px-5 border-b border-gray-800">
      <NuxtLink to="/admin" class="flex items-center gap-2">
        <span class="text-lg font-display font-bold bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
          Lover's Admin
        </span>
      </NuxtLink>
      <button
        class="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Fechar menu"
        @click="$emit('close')"
      >
        <X class="w-5 h-5 text-gray-400" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all min-h-[48px] text-sm font-medium"
        :class="isActive(link)
          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'"
        @click="$emit('close')"
      >
        <component :is="link.icon" class="w-5 h-5 flex-shrink-0" />
        {{ link.label }}
        <!-- Active indicator -->
        <span v-if="isActive(link)" class="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />
      </NuxtLink>
    </nav>

    <!-- User info + logout -->
    <div class="border-t border-gray-800 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-sm font-bold flex-shrink-0">
          {{ adminUser?.email?.[0]?.toUpperCase() ?? 'A' }}
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-200 truncate">{{ adminUser?.email ?? 'Admin' }}</p>
          <p class="text-xs text-gray-500 capitalize">{{ adminUser?.role?.replace('_', ' ') ?? '' }}</p>
        </div>
      </div>
      <button
        class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors min-h-[44px]"
        @click="logout()"
      >
        <LogOut class="w-4 h-4" />
        Sair
      </button>
    </div>
  </aside>
</template>
