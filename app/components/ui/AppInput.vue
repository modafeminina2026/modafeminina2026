<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  type?: string
  inputmode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal' | 'url' | 'search'
  autocomplete?: string
  error?: string
  success?: boolean
  disabled?: boolean
  required?: boolean
  icon?: unknown
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  inputmode: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => props.id ?? `input-${Math.random().toString(36).slice(2)}`)

const borderClass = computed(() => {
  if (props.error) return 'border-red-400 focus:ring-red-400'
  if (props.success) return 'border-green-400 focus:ring-green-400'
  return 'border-gray-300 focus:ring-rose-400'
})
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
    <label
      v-if="props.label"
      :for="inputId"
      class="text-sm font-medium text-gray-700"
    >
      {{ props.label }}
      <span v-if="props.required" class="text-rose-500 ml-0.5" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <component
        :is="props.icon"
        v-if="props.icon"
        class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
        aria-hidden="true"
      />

      <input
        :id="inputId"
        :value="props.modelValue"
        :type="props.type"
        :inputmode="props.inputmode"
        :autocomplete="props.autocomplete"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :required="props.required"
        :aria-invalid="!!props.error"
        :aria-describedby="props.error ? `${inputId}-error` : undefined"
        class="w-full h-12 rounded-lg border bg-white px-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed"
        :class="[borderClass, props.icon ? 'pl-10' : '']"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <p
      v-if="props.error"
      :id="`${inputId}-error`"
      class="text-sm text-red-500 mt-0.5"
      role="alert"
    >
      {{ props.error }}
    </p>
  </div>
</template>
