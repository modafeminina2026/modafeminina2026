<script setup lang="ts">
definePageMeta({ layout: false })

const sidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 flex">
    <!-- Sidebar desktop -->
    <AdminSidebar class="hidden lg:flex" />

    <!-- Sidebar mobile drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="sidebarOpen" class="fixed inset-0 z-50 lg:hidden flex">
          <div class="fixed inset-0 bg-black/60" @click="sidebarOpen = false" />
          <AdminSidebar class="relative z-10 flex" @close="sidebarOpen = false" />
        </div>
      </Transition>
    </Teleport>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0 lg:ml-64">
      <AdminTopBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="flex-1 p-4 md:p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.2s; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
</style>
