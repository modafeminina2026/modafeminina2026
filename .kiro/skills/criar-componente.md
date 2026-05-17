---
name: Create Vue Component
description: Process for creating new Vue components with mobile-first focus
---

# Create Vue Component

## 1. PRE-CHECK
- Search if the component already exists
- Check for reusable similar components
- Review shadcn-vue references
- Define behavior on 360px screens

## 2. REQUIRED STRUCTURE

```vue
<script setup lang="ts">
interface Props {
  // explicit types only
}

const props = withDefaults(defineProps<Props>(), {
  // defaults
})

const emit = defineEmits<{
  // typed events
}>()
</script>

<template>
  <!--
    MOBILE-FIRST RULE:
    Base classes = mobile
    sm: = 640px+
    md: = 768px+
    lg: = 1024px+
    xl: = 1280px+
  -->
</template>
```