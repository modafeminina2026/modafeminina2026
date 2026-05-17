<script setup lang="ts">
const testimonials = [
  {
    name: 'Carlos M.',
    avatar: 'https://i.pravatar.cc/80?img=11',
    rating: 5,
    text: 'Comprei um conjunto de lingerie para minha namorada e ela amou! A embalagem de presente ficou linda e a entrega foi super rápida.',
  },
  {
    name: 'Rafael S.',
    avatar: 'https://i.pravatar.cc/80?img=12',
    rating: 5,
    text: 'Retirei na loja com o código e foi muito prático. O atendimento foi excelente e o perfume que escolhi é incrível. Recomendo!',
  },
  {
    name: 'André L.',
    avatar: 'https://i.pravatar.cc/80?img=13',
    rating: 5,
    text: 'Presente perfeito para o aniversário da minha esposa. As joias são de altíssima qualidade e o site é muito fácil de usar.',
  },
]
</script>

<template>
  <section aria-label="Depoimentos de clientes">
    <h2 class="text-xl sm:text-2xl font-display font-bold text-gray-900 text-center mb-6 sm:mb-8">
      O Que Nossos Clientes Dizem 💕
    </h2>

    <!-- Mobile: vertical stack -->
    <div class="flex flex-col gap-4 md:hidden">
      <article
        v-for="t in testimonials"
        :key="t.name"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
      >
        <div class="flex items-center gap-3 mb-3">
          <img :src="t.avatar" :alt="t.name" loading="lazy" class="w-10 h-10 rounded-full object-cover" />
          <div>
            <p class="font-semibold text-gray-900 text-sm">{{ t.name }}</p>
            <div class="flex gap-0.5" :aria-label="`${t.rating} estrelas`">
              <span v-for="i in 5" :key="i" class="text-sm" :class="i <= t.rating ? 'text-yellow-400' : 'text-gray-200'" aria-hidden="true">★</span>
            </div>
          </div>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">"{{ t.text }}"</p>
      </article>
    </div>

    <!-- Desktop: 3 columns -->
    <div class="hidden md:grid md:grid-cols-3 gap-6">
      <article
        v-for="t in testimonials"
        :key="t.name"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex gap-0.5 mb-3" :aria-label="`${t.rating} estrelas`">
          <span v-for="i in 5" :key="i" class="text-lg" :class="i <= t.rating ? 'text-yellow-400' : 'text-gray-200'" aria-hidden="true">★</span>
        </div>
        <p class="text-gray-600 leading-relaxed mb-4">"{{ t.text }}"</p>
        <div class="flex items-center gap-3">
          <img :src="t.avatar" :alt="t.name" loading="lazy" class="w-10 h-10 rounded-full object-cover" />
          <p class="font-semibold text-gray-900 text-sm">{{ t.name }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
