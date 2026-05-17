<script setup lang="ts">
const cartDrawerOpen = useState('cart-drawer-open', () => false)
const showScrollTop = ref(false)

function onScroll() {
  showScrollTop.value = window.scrollY > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <main id="main-content" class="flex-1 pb-16 md:pb-0">
      <slot />
    </main>

    <AppFooter />
    <MobileBottomNav />
    <AppToast />
    <CartDrawer v-model="cartDrawerOpen" />

    <!-- Scroll to top button -->
    <Transition name="scroll-top">
      <button
        v-if="showScrollTop"
        class="fixed bottom-20 right-4 md:bottom-6 z-30 flex items-center justify-center w-11 h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-colors active:scale-95"
        aria-label="Voltar ao topo"
        @click="scrollToTop"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7-7" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.scroll-top-enter-active, .scroll-top-leave-active { transition: opacity 0.2s, transform 0.2s; }
.scroll-top-enter-from, .scroll-top-leave-to { opacity: 0; transform: translateY(8px); }
</style>
