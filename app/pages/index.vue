<script setup lang="ts">
import HeroBanner from '~/components/home/HeroBanner.vue'
import CategoryShowcase from '~/components/home/CategoryShowcase.vue'
import FeaturedProducts from '~/components/home/FeaturedProducts.vue'
import PickupBanner from '~/components/home/PickupBanner.vue'
import PromoBanner from '~/components/home/PromoBanner.vue'
import WhyChooseUs from '~/components/home/WhyChooseUs.vue'
import TestimonialsSection from '~/components/home/TestimonialsSection.vue'
import NewsletterSection from '~/components/home/NewsletterSection.vue'

// Structured data para SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Lover\'s Brasileiras',
  description: 'Presentes românticos e sofisticados: lingerie, perfumes, joias e maquiagens. Entrega ou retirada grátis na loja.',
  url: 'https://loversbrasileiras.com.br',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://loversbrasileiras.com.br/produtos?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

const organizationData = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'Lover\'s Brasileiras',
  description: 'Loja de presentes românticos e sofisticados',
  url: 'https://loversbrasileiras.com.br',
  telephone: '+55-11-99999-9999',
  email: 'contato@loversbrasileiras.com.br',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'R. Dep. João Sussumu Hirata, 721',
    addressLocality: 'São Paulo',
    addressRegion: 'SP',
    postalCode: '01310-100',
    addressCountry: 'BR',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '14:00',
    },
  ],
  priceRange: 'R$ 50 - R$ 500',
}

// SEO
useHead({
  title: "Lover's Brasileiras — Presentes Românticos para Surpreender Quem Você Ama",
  meta: [
    {
      name: 'description',
      content: 'Presentes românticos e sofisticados: lingerie, perfumes, joias e maquiagens. Entrega ou retirada grátis na loja em até 3 dias úteis.',
    },
    { property: 'og:title', content: "Lover's Brasileiras — Presentes Românticos" },
    { property: 'og:description', content: 'Presentes românticos e sofisticados para surpreender quem você ama.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://loversbrasileiras.com.br' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: "Lover's Brasileiras — Presentes Românticos" },
    { name: 'twitter:description', content: 'Presentes românticos e sofisticados para surpreender quem você ama.' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(structuredData),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(organizationData),
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Banner -->
    <HeroBanner />

    <!-- Category Showcase -->
    <section class="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <CategoryShowcase />
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <FeaturedProducts />
      </div>
    </section>

    <!-- Pickup Banner -->
    <section class="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <PickupBanner />
      </div>
    </section>

    <!-- Promo Banner -->
    <section class="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 to-rose-50">
      <div class="max-w-7xl mx-auto">
        <PromoBanner />
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <WhyChooseUs />
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <TestimonialsSection />
      </div>
    </section>

    <!-- Newsletter -->
    <section class="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-rose-500 to-purple-500">
      <div class="max-w-7xl mx-auto">
        <NewsletterSection />
      </div>
    </section>
  </div>
</template>
