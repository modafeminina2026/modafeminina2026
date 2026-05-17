<script setup lang="ts">
interface Props {
  variant?: 'rose' | 'purple' | 'green' | 'red' | 'gray' | 'yellow'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'rose',
  size: 'md',
})

const variantClasses: Record<string, string> = {
  rose:   'bg-rose-100 text-rose-700 border-rose-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  green:  'bg-green-100 text-green-700 border-green-200',
  red:    'bg-red-100 text-red-700 border-red-200',
  gray:   'bg-gray-100 text-gray-600 border-gray-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

const sizeClasses: Record<string, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
}
</script>

<template>
  <span
    class="inline-flex items-center font-medium rounded-full border"
    :class="[variantClasses[props.variant], sizeClasses[props.size]]"
  >
    <slot />
  </span>
</template>
