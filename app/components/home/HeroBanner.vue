<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section
    class="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-900 via-rose-700 to-purple-800"
    aria-label="Banner principal"
  >
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-10" aria-hidden="true">
      <div class="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl" />
      <div class="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-purple-300 blur-3xl" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-rose-300 blur-3xl" />
    </div>

    <!-- Content -->
    <div class="relative z-10 text-center px-4 py-16 max-w-2xl mx-auto">
      <p class="text-rose-200 text-sm sm:text-base font-medium tracking-widest uppercase mb-4 animate-fade-in">
        💝 Presentes com Amor
      </p>

      <h1 class="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
        Surpreenda<br class="sm:hidden" />
        <span class="text-rose-300"> Quem Você Ama</span>
      </h1>

      <p class="text-rose-100 text-base sm:text-lg leading-relaxed mb-8 max-w-md mx-auto">
        Lingerie, perfumes, joias e maquiagens selecionados com carinho para momentos inesquecíveis.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <NuxtLink to="/produtos">
          <AppButton variant="secondary" size="lg" :icon-right="ArrowRight">
            Ver Presentes
          </AppButton>
        </NuxtLink>
        <NuxtLink to="/retirada">
          <AppButton variant="outline" size="lg" class="border-white/40 text-white hover:bg-white/10">
            🏪 Retirada Grátis
          </AppButton>
        </NuxtLink>
      </div>

      <!-- Trust badges -->
      <div class="flex flex-wrap items-center justify-center gap-4 mt-10 text-rose-200 text-xs sm:text-sm">
        <span class="flex items-center gap-1.5">🔒 Pagamento Seguro</span>
        <span class="hidden sm:block text-rose-600">•</span>
        <span class="flex items-center gap-1.5">🎁 Embalagem de Presente</span>
        <span class="hidden sm:block text-rose-600">•</span>
        <span class="flex items-center gap-1.5">🏪 Retirada em 3 Dias</span>
      </div>
    </div>
  </section>
</template>
