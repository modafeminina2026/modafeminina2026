<script setup lang="ts">
import { User, Mail, Phone, CreditCard, Package, Heart, LogOut, ChevronRight, Edit3, Check, X } from 'lucide-vue-next'
import type { ProfileUpdate } from '~/composables/useAuth'

definePageMeta({ middleware: 'auth' })

const { user, fetchProfile, updateProfile, logout, loading } = useAuth()

interface Profile {
  full_name: string
  email: string
  phone: string
  cpf: string
}

const profile = ref<Profile | null>(null)
const editing = ref(false)
const form = reactive({
  full_name: '',
  phone: '',
})

onMounted(async () => {
  profile.value = await fetchProfile() as Profile | null
  if (profile.value) {
    form.full_name = profile.value.full_name ?? ''
    form.phone = profile.value.phone ?? ''
  }
})

async function saveProfile() {
  const updates: ProfileUpdate = {
    full_name: form.full_name,
    phone: form.phone,
  }
  const ok = await updateProfile(updates)
  if (ok) {
    if (profile.value) {
      profile.value.full_name = form.full_name
      profile.value.phone = form.phone
    }
    editing.value = false
  }
}

function cancelEdit() {
  if (profile.value) {
    form.full_name = profile.value.full_name ?? ''
    form.phone = profile.value.phone ?? ''
  }
  editing.value = false
}

const initials = computed(() => {
  const name = profile.value?.full_name ?? user.value?.email ?? '?'
  return name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
})

const menuLinks = [
  { to: '/perfil/pedidos', icon: Package, label: 'Meus Pedidos', desc: 'Acompanhe seus pedidos' },
  { to: '/perfil/wishlist', icon: Heart, label: 'Lista de Desejos', desc: 'Produtos salvos' },
  { to: '/perfil/cartoes', icon: CreditCard, label: 'Cartões Salvos', desc: 'Gerencie seus cartões' },
]

useHead({
  title: 'Meu Perfil — Lover\'s Brasileiras',
  meta: [{ name: 'description', content: 'Gerencie sua conta na Lover\'s Brasileiras.' }],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24 md:pb-8">
    <div class="max-w-2xl mx-auto px-4 py-6">
      <!-- Avatar e nome -->
      <div class="bg-gradient-to-r from-rose-500 to-purple-500 rounded-3xl p-6 text-white mb-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {{ initials }}
          </div>
          <div class="min-w-0">
            <h1 class="text-xl font-semibold truncate">
              {{ profile?.full_name ?? 'Carregando...' }}
            </h1>
            <p class="text-white/80 text-sm truncate">{{ user?.email }}</p>
          </div>
          <button
            class="ml-auto p-2 bg-white/20 rounded-full hover:bg-white/30 active:bg-white/40 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Editar perfil"
            @click="editing = !editing"
          >
            <Edit3 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Formulário de edição -->
      <div v-if="editing" class="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <h2 class="font-semibold text-gray-800 mb-4">Editar Perfil</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              v-model="form.full_name"
              type="text"
              class="w-full h-12 px-4 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
              placeholder="Seu nome completo"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full h-12 px-4 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
              placeholder="(00) 00000-0000"
            >
          </div>
        </div>
        <div class="flex gap-3 mt-4">
          <button
            class="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-3 rounded-xl min-h-[48px] flex items-center justify-center gap-2 hover:from-rose-600 hover:to-pink-600 active:scale-[0.97] transition-all disabled:opacity-60"
            :disabled="loading"
            @click="saveProfile"
          >
            <Check class="w-4 h-4" />
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
          <button
            class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl min-h-[48px] flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-[0.97] transition-all"
            @click="cancelEdit"
          >
            <X class="w-4 h-4" />
            Cancelar
          </button>
        </div>
      </div>

      <!-- Dados do perfil (leitura) -->
      <div v-else class="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <h2 class="font-semibold text-gray-800 mb-4">Dados da Conta</h2>
        <div class="space-y-3">
          <div class="flex items-center gap-3 text-sm">
            <User class="w-4 h-4 text-rose-400 flex-shrink-0" />
            <div>
              <p class="text-xs text-gray-400">Nome</p>
              <p class="text-gray-700 font-medium">{{ profile?.full_name ?? '—' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <Mail class="w-4 h-4 text-rose-400 flex-shrink-0" />
            <div>
              <p class="text-xs text-gray-400">E-mail</p>
              <p class="text-gray-700 font-medium">{{ user?.email ?? '—' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <Phone class="w-4 h-4 text-rose-400 flex-shrink-0" />
            <div>
              <p class="text-xs text-gray-400">Telefone</p>
              <p class="text-gray-700 font-medium">{{ profile?.phone ?? '—' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Links de navegação -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
        <NuxtLink
          v-for="link in menuLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 last:border-0 min-h-[64px]"
        >
          <div class="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center flex-shrink-0">
            <component :is="link.icon" class="w-5 h-5 text-rose-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-800 text-sm">{{ link.label }}</p>
            <p class="text-xs text-gray-500">{{ link.desc }}</p>
          </div>
          <ChevronRight class="w-4 h-4 text-gray-400 flex-shrink-0" />
        </NuxtLink>
      </div>

      <!-- Logout -->
      <button
        class="w-full bg-white text-red-500 font-semibold py-4 rounded-2xl min-h-[56px] flex items-center justify-center gap-2 shadow-sm hover:bg-red-50 active:scale-[0.97] transition-all border border-red-100"
        @click="logout()"
      >
        <LogOut class="w-4 h-4" />
        Sair da Conta
      </button>
    </div>
  </div>
</template>
