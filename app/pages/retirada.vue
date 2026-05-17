<script setup lang="ts">
import { MapPin, Clock, Package, CheckCircle, ChevronDown, ChevronUp } from 'lucide-vue-next'

useHead({
  title: 'Retirada na Loja — Lover\'s Brasileiras',
  meta: [{ name: 'description', content: 'Saiba como funciona a retirada gratuita na loja Lover\'s Brasileiras.' }],
})

const steps = [
  {
    number: '1',
    title: 'Escolha seus produtos',
    desc: 'Navegue pelo catálogo e adicione ao carrinho os produtos desejados.',
    icon: '🛍️',
  },
  {
    number: '2',
    title: 'Selecione "Retirada na Loja"',
    desc: 'No checkout, escolha a opção de retirada. O frete é totalmente GRÁTIS!',
    icon: '📍',
  },
  {
    number: '3',
    title: 'Receba seu código de 4 dígitos',
    desc: 'Após o pagamento, você receberá um código único de 4 dígitos para retirar seu pedido.',
    icon: '🔢',
  },
  {
    number: '4',
    title: 'Retire em 3 dias úteis',
    desc: 'Seu pedido estará pronto em até 3 dias úteis. Apresente o código na loja e pronto!',
    icon: '✅',
  },
]

const faqs = ref([
  {
    q: 'Quanto tempo tenho para retirar meu pedido?',
    a: 'Você tem até 7 dias corridos após o pedido estar pronto para retirada. Após esse prazo, entraremos em contato para reagendar.',
    open: false,
  },
  {
    q: 'Preciso levar algum documento?',
    a: 'Sim, é necessário apresentar um documento de identidade com foto (RG, CNH ou passaporte) junto com o código de 4 dígitos.',
    open: false,
  },
  {
    q: 'Outra pessoa pode retirar no meu lugar?',
    a: 'Sim! Basta que a pessoa apresente o código de 4 dígitos e um documento de identidade. Recomendamos que você informe o nome da pessoa ao entrar em contato conosco.',
    open: false,
  },
  {
    q: 'O que acontece se eu perder o código?',
    a: 'Não se preocupe! Você pode encontrar o código na seção "Meus Pedidos" da sua conta, ou entrar em contato conosco pelo WhatsApp.',
    open: false,
  },
  {
    q: 'A retirada é realmente gratuita?',
    a: 'Sim, 100% gratuita! Ao escolher a retirada na loja, o frete é zerado automaticamente. Nenhuma taxa adicional.',
    open: false,
  },
  {
    q: 'Posso trocar ou devolver na loja?',
    a: 'Sim! Trocas e devoluções podem ser feitas diretamente na loja dentro do prazo de 30 dias, conforme o Código de Defesa do Consumidor.',
    open: false,
  },
])

function toggleFaq(index: number) {
  faqs.value[index].open = !faqs.value[index].open
}
</script>

<template>
  <div class="min-h-screen bg-white pb-24 md:pb-8">
    <!-- Hero -->
    <div class="bg-gradient-to-br from-rose-500 to-pink-600 text-white py-12 px-4">
      <div class="max-w-3xl mx-auto text-center">
        <div class="text-5xl mb-4">🏪</div>
        <h1 class="text-2xl md:text-4xl font-display font-bold mb-3">
          Retirada Gratuita na Loja
        </h1>
        <p class="text-white/90 text-base md:text-lg max-w-xl mx-auto">
          Compre online e retire sem pagar frete. Simples, rápido e seguro!
        </p>
        <div class="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
          <CheckCircle class="w-4 h-4" />
          Frete 100% GRÁTIS
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-10">
      <!-- Como funciona -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-bold text-gray-900 mb-6 text-center">Como Funciona</h2>
        <div class="space-y-4">
          <div
            v-for="step in steps"
            :key="step.number"
            class="flex items-start gap-4 bg-rose-50 rounded-2xl p-4"
          >
            <div class="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {{ step.number }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xl">{{ step.icon }}</span>
                <h3 class="font-semibold text-gray-800">{{ step.title }}</h3>
              </div>
              <p class="text-sm text-gray-600">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Código de retirada exemplo -->
      <section class="mb-12">
        <div class="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-6 text-white text-center">
          <p class="text-white/80 text-sm uppercase tracking-wider mb-2">Exemplo de Código de Retirada</p>
          <div class="text-6xl font-mono font-bold tracking-[0.4em] mb-3">1234</div>
          <p class="text-white/80 text-sm">Código único gerado automaticamente após o pagamento</p>
        </div>
      </section>

      <!-- Informações da loja -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">Nossa Loja</h2>
        <div class="bg-gray-50 rounded-3xl p-6 space-y-4">
          <div class="flex items-start gap-3">
            <MapPin class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-medium text-gray-700">Endereço</p>
              <p class="text-gray-600 text-sm">Rua das Flores, 123 — Centro</p>
              <p class="text-gray-600 text-sm">São Paulo, SP — CEP 01310-100</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Clock class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-medium text-gray-700">Horário de Funcionamento</p>
              <p class="text-gray-600 text-sm">Segunda a Sexta: 9h às 18h</p>
              <p class="text-gray-600 text-sm">Sábado: 9h às 14h</p>
              <p class="text-gray-500 text-xs mt-1">Domingos e feriados: fechado</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Package class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-medium text-gray-700">Prazo de Preparo</p>
              <p class="text-gray-600 text-sm">Até 3 dias úteis após confirmação do pagamento</p>
              <p class="text-gray-500 text-xs mt-1">Você será notificado quando o pedido estiver pronto</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="mb-12">
        <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
        <div class="space-y-2">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
          >
            <button
              class="w-full flex items-center justify-between px-4 py-4 text-left min-h-[56px] hover:bg-gray-50 active:bg-gray-100 transition-colors"
              @click="toggleFaq(index)"
            >
              <span class="font-medium text-gray-800 text-sm pr-4">{{ faq.q }}</span>
              <component
                :is="faq.open ? ChevronUp : ChevronDown"
                class="w-4 h-4 text-gray-400 flex-shrink-0"
              />
            </button>
            <div v-if="faq.open" class="px-4 pb-4">
              <p class="text-sm text-gray-600">{{ faq.a }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <div class="text-center">
        <NuxtLink
          to="/produtos"
          class="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold px-8 py-4 rounded-full min-h-[56px] hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all text-base"
        >
          Comprar para Retirada Grátis
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
