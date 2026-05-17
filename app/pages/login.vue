<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

useHead({
  title: 'Entrar — Lover\'s Brasileiras',
  meta: [{ name: 'description', content: 'Faça login na sua conta Lover\'s Brasileiras.' }],
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo / Brand -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block">
          <h1 class="text-3xl font-display font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
            Lover's Brasileiras
          </h1>
        </NuxtLink>
        <p class="text-gray-500 mt-2 text-sm">Presentes que falam por você 💕</p>
      </div>

      <!-- Card do formulário -->
      <div class="bg-white rounded-3xl shadow-xl p-6 md:p-8">
        <LoginForm />
      </div>
    </div>
  </div>
</template>
