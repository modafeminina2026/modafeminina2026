<script setup lang="ts">
import { Instagram, Facebook, MapPin, Phone, Mail } from 'lucide-vue-next'

const newsletterEmail = ref('')
const subscribed = ref(false)

function subscribe() {
  if (!newsletterEmail.value) return
  subscribed.value = true
  newsletterEmail.value = ''
}
</script>

<template>
  <footer class="bg-gradient-to-br from-rose-900 via-rose-800 to-purple-900 text-white">
    <div class="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

        <!-- Brand -->
        <div class="sm:col-span-2 lg:col-span-1">
          <p class="font-display text-xl font-bold text-white mb-2">Lover's Brasileiras</p>
          <p class="text-rose-200 text-sm leading-relaxed mb-4">
            Presentes românticos e sofisticados para surpreender quem você ama. Lingerie, perfumes, joias e maquiagens.
          </p>
          <div class="flex gap-3">
            <a href="#" aria-label="Instagram" class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <Instagram class="w-4 h-4" aria-hidden="true" />
            </a>
            <a href="#" aria-label="Facebook" class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <Facebook class="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <!-- Links -->
        <div>
          <p class="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Navegação</p>
          <ul class="space-y-2">
            <li v-for="link in [['/', 'Início'], ['/produtos', 'Produtos'], ['/sobre', 'Sobre'], ['/retirada', 'Retirada na Loja']]" :key="link[0]">
              <NuxtLink :to="link[0]" class="text-rose-200 hover:text-white text-sm transition-colors">{{ link[1] }}</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Store info -->
        <div>
          <p class="font-semibold text-white mb-3 text-sm uppercase tracking-wider">🏪 Nossa Loja</p>
          <ul class="space-y-2 text-rose-200 text-sm">
            <li class="flex items-start gap-2">
              <MapPin class="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>R. Dep. João Sussumu Hirata, 721<br>Centro — São Paulo, SP</span>
            </li>
            <li class="flex items-center gap-2">
              <Phone class="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>(11) 99999-9999</span>
            </li>
            <li class="flex items-center gap-2">
              <Mail class="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>contato@loversbrasileiras.com.br</span>
            </li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <p class="font-semibold text-white mb-3 text-sm uppercase tracking-wider">💌 Newsletter</p>
          <p class="text-rose-200 text-sm mb-3">Receba ofertas exclusivas no seu e-mail.</p>
          <div v-if="!subscribed" class="flex flex-col gap-2">
            <input
              v-model="newsletterEmail"
              type="email"
              placeholder="seu@email.com"
              class="h-11 px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-rose-300 text-base focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="E-mail para newsletter"
            />
            <AppButton variant="secondary" full-width @click="subscribe">Quero Ofertas</AppButton>
          </div>
          <p v-else class="text-green-300 text-sm font-medium">✓ Inscrito com sucesso!</p>
        </div>
      </div>

      <hr class="my-8 border-white/10">

      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-rose-300 text-xs">
        <p>© 2025 Lover's Brasileiras. Todos os direitos reservados.</p>
        <div class="flex gap-4">
          <NuxtLink to="/privacidade" class="hover:text-white transition-colors">Privacidade</NuxtLink>
          <NuxtLink to="/termos" class="hover:text-white transition-colors">Termos de Uso</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
