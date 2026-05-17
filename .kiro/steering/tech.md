# Tech Steering — Technical Rules and Security

## STACK
- Framework: Nuxt 3
- CSS: TailwindCSS
- UI: shadcn-vue
- Database: Supabase
- Payments: Stripe
- Language: TypeScript (required)

## ⚠️ RULE #1 — MOBILE-FIRST

### Philosophy
- 80% of users are on mobile devices
- ALWAYS write mobile styles first
- NEVER design desktop first and adapt later
- The website MUST be fully usable on mobile

### Correct Mobile-First Examples

✅ Correct:
class="text-sm md:text-base lg:text-lg"

class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

class="flex flex-col md:flex-row"

❌ Wrong:
class="text-lg sm:text-base"

class="grid grid-cols-4 sm:grid-cols-1"

## TOUCH TARGETS
- Buttons: minimum 44x44px
- Clickable icons: minimum 44x44px
- Minimum spacing between clickable elements: 8px

## MOBILE FORMS
- Inputs minimum height: 48px
- Input font-size minimum: 16px
- Labels always ABOVE inputs
- Use proper input types:
  - type="email"
  - type="tel"
  - inputmode="numeric"

## MOBILE NAVIGATION
- Sticky header
- Hamburger menu or bottom navigation
- Drawers instead of desktop dropdowns
- Floating back-to-top button

## IMAGES & PERFORMANCE
- Use loading="lazy"
- Define aspect ratios
- Use responsive sizes
- Prefer WebP when possible
- Skeleton loading states

## TOUCH INTERACTIONS
- Support swipe gestures
- NEVER rely only on hover
- Hover is optional enhancement for desktop
- Use active states for touch feedback

## MOBILE TYPOGRAPHY
- Body text minimum: 14px
- Prefer 16px body text
- Responsive headings:
  - text-xl md:text-2xl lg:text-4xl

## MOBILE MODALS
- Mobile modals should be fullscreen or bottom sheets
- Large close button
- Tap backdrop to close

## TYPESCRIPT RULES
- NEVER use any
- Type all props and functions
- No TODO placeholders

## SECURITY RULES

### Secrets
- NEVER expose STRIPE_SECRET_KEY on frontend
- NEVER expose SUPABASE_SERVICE_ROLE_KEY on frontend
- Public keys only in public runtime config
- Secret keys only on server

### Supabase
- NEVER disable RLS
- ALWAYS create policies
- Sensitive operations only on backend

### Stripe
- Frontend only uses public key
- Backend uses secret key
- Validate webhook signatures
- NEVER store full card numbers

## GENERAL RULES
- ALWAYS validate server inputs
- NEVER trust frontend data
- ALWAYS use try/catch
- NEVER expose internal errors to users

## COMPONENT PATTERN

```vue
<script setup lang="ts">
// Imports
// Props
// Emits
// Composables
// Reactive state
// Computed
// Functions
// Lifecycle hooks
</script>

<template>
  <!-- Mobile-first Tailwind classes -->
</template>
```

## EXECUTION PROTOCOL
1. Explain briefly what will be done
2. Execute task completely
3. Confirm completion
4. Wait for next instruction
5. Ask if uncertain

## 📱 REQUIRED MOBILE CHECKLIST
- Mobile-first classes?
- Touch targets >= 44px?
- Font-size >= 14px?
- Inputs >= 16px?
- Works without hover?
- Lazy-loaded images?
- No horizontal scroll?
- Buttons visible on mobile?
- Works on 360px viewport?