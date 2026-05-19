<script setup lang="ts">
import { Heart, MapPin, Clock, Phone, Mail, Star, Shield, Truck, Gift } from 'lucide-vue-next'

useHead({
  title: 'Sobre Nós — Lover\'s Brasileiras',
  meta: [{ name: 'description', content: 'Conheça a Lover\'s Brasileiras — presentes românticos para quem você ama.' }],
})

const values = [
  { icon: Heart, title: 'Amor em Cada Detalhe', desc: 'Cada produto é selecionado com carinho para tornar momentos especiais ainda mais inesquecíveis.' },
  { icon: Shield, title: 'Qualidade Garantida', desc: 'Trabalhamos apenas com marcas e fornecedores de confiança, garantindo produtos de alta qualidade.' },
  { icon: Truck, title: 'Entrega Segura', desc: 'Embalagens discretas e seguras para que seu presente chegue perfeito ao destino.' },
  { icon: Gift, title: 'Experiência Única', desc: 'Desde a escolha até a entrega, criamos uma experiência de compra especial e memorável.' },
]
</script>

<template>
  <div class="min-h-screen bg-white pb-24 md:pb-8">
    <!-- Hero -->
    <div class="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white py-16 px-4">
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="text-3xl md:text-5xl font-display font-bold mb-4">
          Lover's Brasileiras
        </h1>
        <p class="text-white/90 text-base md:text-xl max-w-xl mx-auto">
          Presentes que falam por você. Porque amor merece ser celebrado todos os dias.
        </p>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-10">
      <!-- Nossa história -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">Nossa História</h2>
        <div class="prose prose-gray max-w-none text-gray-600 space-y-4">
          <p>
            A Lover's Brasileiras nasceu de uma ideia simples: facilitar a vida de quem quer presentear a pessoa amada com algo especial, sofisticado e cheio de significado.
          </p>
          <p>
            Sabemos que encontrar o presente perfeito pode ser desafiador. Por isso, curadamos uma seleção exclusiva de lingeries, perfumes, joias e maquiagens — produtos que fazem qualquer mulher se sentir única e especial.
          </p>
          <p>
            Nossa missão é transformar cada compra em uma experiência inesquecível, desde a escolha do produto até o momento em que ela abre o presente.
          </p>
        </div>
      </section>

      <!-- Nossos valores -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-bold text-gray-900 mb-6">Nossos Valores</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="value in values"
            :key="value.title"
            class="bg-rose-50 rounded-2xl p-5"
          >
            <div class="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mb-3">
              <component :is="value.icon" class="w-5 h-5 text-rose-500" />
            </div>
            <h3 class="font-semibold text-gray-800 mb-1">{{ value.title }}</h3>
            <p class="text-sm text-gray-600">{{ value.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Categorias -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">O Que Oferecemos</h2>
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink to="/categoria/lingerie" class="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart class="w-5 h-5 text-rose-500" />
            </div>
            <p class="font-semibold text-gray-800 text-sm">Lingerie</p>
            <p class="text-xs text-gray-500 mt-1">Elegância e sensualidade</p>
          </NuxtLink>
          <NuxtLink to="/categoria/perfumes" class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles class="w-5 h-5 text-purple-500" />
            </div>
            <p class="font-semibold text-gray-800 text-sm">Perfumes</p>
            <p class="text-xs text-gray-500 mt-1">Fragrâncias exclusivas</p>
          </NuxtLink>
          <NuxtLink to="/categoria/joias" class="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star class="w-5 h-5 text-amber-500" />
            </div>
            <p class="font-semibold text-gray-800 text-sm">Joias</p>
            <p class="text-xs text-gray-500 mt-1">Peças que encantam</p>
          </NuxtLink>
          <NuxtLink to="/categoria/maquiagens" class="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift class="w-5 h-5 text-pink-500" />
            </div>
            <p class="font-semibold text-gray-800 text-sm">Maquiagens</p>
            <p class="text-xs text-gray-500 mt-1">Beleza e sofisticação</p>
          </NuxtLink>
        </div>
      </section>

      <!-- Informações da loja -->
      <section class="bg-gray-50 rounded-3xl p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Informações da Loja</h2>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <MapPin class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-medium text-gray-700 text-sm">Endereço</p>
              <p class="text-gray-600 text-sm">Rua das Flores, 123 — Centro</p>
              <p class="text-gray-600 text-sm">São Paulo, SP — CEP 01310-100</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Clock class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-medium text-gray-700 text-sm">Horário de Funcionamento</p>
              <p class="text-gray-600 text-sm">Segunda a Sexta: 9h às 18h</p>
              <p class="text-gray-600 text-sm">Sábado: 9h às 14h</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Phone class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-medium text-gray-700 text-sm">Telefone / WhatsApp</p>
              <a href="tel:+5511999999999" class="text-rose-500 text-sm hover:text-rose-600">(11) 99999-9999</a>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Mail class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-medium text-gray-700 text-sm">E-mail</p>
              <a href="mailto:contato@loversbrasileiras.com.br" class="text-rose-500 text-sm hover:text-rose-600">contato@loversbrasileiras.com.br</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
