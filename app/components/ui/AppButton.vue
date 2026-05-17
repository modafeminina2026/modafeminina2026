<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  iconLeft?: unknown
  iconRight?: unknown
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false,
  type: 'button',
})

const variantClasses: Record<string, string> = {
  primary:   'bg-rose-600 hover:bg-rose-700 text-white border-transparent active:scale-[0.97]',
  secondary: 'bg-purple-500 hover:bg-purple-600 text-white border-transparent active:scale-[0.97]',
  outline:   'bg-transparent hover:bg-rose-50 text-rose-600 border-rose-300 active:scale-[0.97]',
  ghost:     'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent active:scale-[0.97]',
  danger:    'bg-red-600 hover:bg-red-700 text-white border-transparent active:scale-[0.97]',
}

const sizeClasses: Record<string, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled || props.loading"
    class="inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    :class="[
      variantClasses[props.variant],
      sizeClasses[props.size],
      props.fullWidth ? 'w-full' : '',
    ]"
  >
    <!-- Loading spinner -->
    <svg
      v-if="props.loading"
      class="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>

    <component :is="props.iconLeft" v-else-if="props.iconLeft" class="h-4 w-4 shrink-0" aria-hidden="true" />

    <slot />

    <component :is="props.iconRight" v-if="props.iconRight && !props.loading" class="h-4 w-4 shrink-0" aria-hidden="true" />
  </button>
</template>
