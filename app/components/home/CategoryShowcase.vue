<script setup lang="ts">
const categories = [
  {
    name: 'Lingerie',
    slug: 'lingerie',
    emoji: '👙',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&q=80',
    description: 'Peças íntimas sofisticadas',
  },
  {
    name: 'Perfumes',
    slug: 'perfumes',
    emoji: '🌸',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80',
    description: 'Fragrâncias exclusivas',
  },
  {
    name: 'Joias',
    slug: 'joias',
    emoji: '💎',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
    description: 'Elegância que eterniza',
  },
  {
    name: 'Maquiagens',
    slug: 'maquiagens',
    emoji: '💄',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80',
    description: 'Beleza premium',
  },
]
</script>

<template>
  <section aria-label="Categorias">
    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <h2 class="text-xl sm:text-2xl font-display font-bold text-gray-900">Nossas Categorias</h2>
      <NuxtLink to="/produtos" class="text-sm text-rose-600 font-medium hover:underline">Ver tudo</NuxtLink>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <NuxtLink
        v-for="cat in categories"
        :key="cat.slug"
        :to="`/categoria/${cat.slug}`"
        class="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 active:scale-[0.98] transition-transform"
        :aria-label="`Ver ${cat.name}`"
      >
        <img
          :src="cat.image"
          :alt="cat.name"
          loading="lazy"
          class="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-105"
        />
        <!-- Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />

        <!-- Text -->
        <div class="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <p class="text-lg sm:text-xl" aria-hidden="true">{{ cat.emoji }}</p>
          <p class="font-bold text-white text-sm sm:text-base leading-tight">{{ cat.name }}</p>
          <p class="text-white/70 text-xs hidden sm:block mt-0.5">{{ cat.description }}</p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
