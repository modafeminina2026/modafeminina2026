<script setup lang="ts">
interface Props {
  images: string[]
  name: string
}

const props = withDefaults(defineProps<Props>(), { images: () => [] })

const current = ref(0)
const touchStartX = ref(0)

const safeImages = computed(() =>
  props.images.length ? props.images : ['https://picsum.photos/600/600?grayscale'],
)

function prev() { current.value = (current.value - 1 + safeImages.value.length) % safeImages.value.length }
function next() { current.value = (current.value + 1) % safeImages.value.length }

function onTouchStart(e: TouchEvent) { touchStartX.value = e.touches[0]?.clientX ?? 0 }
function onTouchEnd(e: TouchEvent) {
  const diff = touchStartX.value - (e.changedTouches[0]?.clientX ?? 0)
  if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Main image -->
    <div
      class="relative aspect-square sm:aspect-[4/5] overflow-hidden rounded-xl bg-gray-50 select-none"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <img
        :src="safeImages[current]"
        :alt="`${props.name} — imagem ${current + 1} de ${safeImages.length}`"
        loading="eager"
        class="w-full h-full object-cover"
      />

      <!-- Counter -->
      <div
        v-if="safeImages.length > 1"
        class="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full"
        aria-live="polite"
        :aria-label="`Imagem ${current + 1} de ${safeImages.length}`"
      >
        {{ current + 1 }}/{{ safeImages.length }}
      </div>

      <!-- Prev/Next arrows (desktop) -->
      <template v-if="safeImages.length > 1">
        <button
          class="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-white/80 hover:bg-white rounded-full shadow transition-colors"
          aria-label="Imagem anterior"
          @click="prev"
        >
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          class="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-white/80 hover:bg-white rounded-full shadow transition-colors"
          aria-label="Próxima imagem"
          @click="next"
        >
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </template>
    </div>

    <!-- Thumbnails -->
    <div
      v-if="safeImages.length > 1"
      class="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide"
      role="tablist"
      :aria-label="`Miniaturas de ${props.name}`"
    >
      <button
        v-for="(img, i) in safeImages"
        :key="i"
        class="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors snap-start"
        :class="i === current ? 'border-rose-500' : 'border-transparent hover:border-rose-300'"
        role="tab"
        :aria-selected="i === current"
        :aria-label="`Ver imagem ${i + 1}`"
        @click="current = i"
      >
        <img :src="img" :alt="`Miniatura ${i + 1}`" loading="lazy" class="w-full h-full object-cover" />
      </button>
    </div>
  </div>
</template>
