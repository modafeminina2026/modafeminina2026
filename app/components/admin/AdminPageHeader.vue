<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="text-xl md:text-2xl font-bold text-gray-100">{{ title }}</h1>
      <p v-if="description" class="text-sm text-gray-400 mt-0.5">{{ description }}</p>
    </div>
    <div class="flex items-center gap-2 flex-shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
