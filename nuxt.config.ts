// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
  ],

  // Components auto-import configuration
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // Supabase module config — reads SUPABASE_URL and SUPABASE_KEY from .env automatically
  supabase: {
    redirect: false, // We handle auth redirects manually via middleware
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/produtos/*', '/categoria/*', '/sobre', '/retirada', '/admin/*'],
    },
    cookieOptions: {
      maxAge: 60 * 60 * 8, // 8 hours
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },

  // Runtime config — public keys exposed to client, private keys server-only
  runtimeConfig: {
    // Server-only (never exposed to client)
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    adminSetupKey: process.env.ADMIN_SETUP_KEY,

    // Public — exposed to client
    public: {
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
      appName: process.env.APP_NAME || "Lover's Brasileiras",
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    },
  },

  // App head — SEO, viewport, fonts
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
      title: "Lover's Brasileiras — Presentes Românticos",
      meta: [
        {
          name: 'description',
          content:
            "Presentes românticos e sofisticados para surpreender quem você ama. Lingerie, perfumes, joias e maquiagens com entrega ou retirada na loja.",
        },
        { name: 'theme-color', content: '#E91E63' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: "Lover's Brasileiras" },
        {
          property: 'og:title',
          content: "Lover's Brasileiras — Presentes Românticos",
        },
        {
          property: 'og:description',
          content:
            'Presentes românticos e sofisticados para surpreender quem você ama.',
        },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: "Lover's Brasileiras — Presentes Românticos",
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // Google Fonts — Inter + Playfair Display
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap',
        },
      ],
    },
    // Page transitions — subtle fade
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  // TailwindCSS — extend with brand colors and fonts
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            brand: {
              rose: '#E91E63',
              'rose-light': '#F48FB1',
              'rose-dark': '#C2185B',
              purple: '#9C27B0',
              'purple-light': '#CE93D8',
              'purple-dark': '#7B1FA2',
            },
          },
          fontFamily: {
            sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            display: [
              'Playfair Display',
              'ui-serif',
              'Georgia',
              'serif',
            ],
          },
        },
      },
    },
  },

  // CSS — global styles (includes Tailwind directives + transitions)
  css: ['~/assets/css/globals.css', '~/assets/css/transitions.css'],
})
