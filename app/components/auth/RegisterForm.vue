<script setup lang="ts">
import { User, Mail, Phone, Lock, Eye, EyeOff, CreditCard } from 'lucide-vue-next'

const { register, loading } = useAuth()

const form = reactive({
  fullName: '', email: '', phone: '', cpf: '',
  password: '', confirmPassword: '',
  acceptTerms: false,
})

const showPwd     = ref(false)
const showConfirm = ref(false)

const errors = reactive({
  fullName: '', email: '', phone: '', cpf: '',
  password: '', confirmPassword: '', acceptTerms: '',
})

// CPF mask: 000.000.000-00
function maskCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

// Phone mask: (00) 00000-0000
function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

function onCpfInput(e: Event) {
  form.cpf = maskCpf((e.target as HTMLInputElement).value)
}

function onPhoneInput(e: Event) {
  form.phone = maskPhone((e.target as HTMLInputElement).value)
}

function validateCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]!) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(digits[9]!)) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]!) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(digits[10]!)
}

function validate() {
  Object.assign(errors, { fullName: '', email: '', phone: '', cpf: '', password: '', confirmPassword: '', acceptTerms: '' })
  if (!form.fullName.trim()) errors.fullName = 'Nome obrigatório'
  if (!form.email) errors.email = 'E-mail obrigatório'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'E-mail inválido'
  if (!form.phone) errors.phone = 'Telefone obrigatório'
  if (form.cpf && !validateCpf(form.cpf)) errors.cpf = 'CPF inválido'
  if (!form.password) errors.password = 'Senha obrigatória'
  else if (form.password.length < 8) errors.password = 'Mínimo 8 caracteres'
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'As senhas não coincidem'
  if (!form.acceptTerms) errors.acceptTerms = 'Você deve aceitar os termos'
  return Object.values(errors).every((e) => !e)
}

async function submit() {
  if (!validate()) return
  const ok = await register({
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    cpf: form.cpf.replace(/\D/g, ''),
    password: form.password,
  })
  if (ok) await navigateTo('/')
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="submit">
    <AppInput
      v-model="form.fullName"
      label="Nome Completo"
      placeholder="Seu nome completo"
      autocomplete="name"
      :icon="User"
      :error="errors.fullName"
      required
    />

    <AppInput
      v-model="form.email"
      label="E-mail"
      type="email"
      inputmode="email"
      autocomplete="email"
      placeholder="seu@email.com"
      :icon="Mail"
      :error="errors.email"
      required
    />

    <!-- Phone -->
    <div class="flex flex-col gap-1 w-full">
      <label class="text-sm font-medium text-gray-700" for="reg-phone">
        Telefone <span class="text-rose-500 ml-0.5" aria-hidden="true">*</span>
      </label>
      <div class="relative">
        <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
        <input
          id="reg-phone"
          :value="form.phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="(11) 99999-9999"
          class="w-full h-12 rounded-lg border bg-white pl-10 pr-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0"
          :class="errors.phone ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-rose-400'"
          @input="onPhoneInput"
        />
      </div>
      <p v-if="errors.phone" class="text-sm text-red-500 mt-0.5" role="alert">{{ errors.phone }}</p>
    </div>

    <!-- CPF -->
    <div class="flex flex-col gap-1 w-full">
      <label class="text-sm font-medium text-gray-700" for="reg-cpf">CPF</label>
      <div class="relative">
        <CreditCard class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
        <input
          id="reg-cpf"
          :value="form.cpf"
          type="text"
          inputmode="numeric"
          placeholder="000.000.000-00"
          maxlength="14"
          class="w-full h-12 rounded-lg border bg-white pl-10 pr-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0"
          :class="errors.cpf ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-rose-400'"
          @input="onCpfInput"
        />
      </div>
      <p v-if="errors.cpf" class="text-sm text-red-500 mt-0.5" role="alert">{{ errors.cpf }}</p>
    </div>

    <!-- Password -->
    <div class="flex flex-col gap-1 w-full">
      <label class="text-sm font-medium text-gray-700" for="reg-password">
        Senha <span class="text-rose-500 ml-0.5" aria-hidden="true">*</span>
      </label>
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
        <input
          id="reg-password"
          v-model="form.password"
          :type="showPwd ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="Mínimo 8 caracteres"
          class="w-full h-12 rounded-lg border bg-white pl-10 pr-12 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0"
          :class="errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-rose-400'"
        />
        <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600"
          :aria-label="showPwd ? 'Ocultar senha' : 'Mostrar senha'" @click="showPwd = !showPwd">
          <EyeOff v-if="showPwd" class="w-4 h-4" aria-hidden="true" />
          <Eye v-else class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      <p v-if="errors.password" class="text-sm text-red-500 mt-0.5" role="alert">{{ errors.password }}</p>
    </div>

    <!-- Confirm password -->
    <div class="flex flex-col gap-1 w-full">
      <label class="text-sm font-medium text-gray-700" for="reg-confirm">
        Confirmar Senha <span class="text-rose-500 ml-0.5" aria-hidden="true">*</span>
      </label>
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
        <input
          id="reg-confirm"
          v-model="form.confirmPassword"
          :type="showConfirm ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="Repita a senha"
          class="w-full h-12 rounded-lg border bg-white pl-10 pr-12 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0"
          :class="errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-rose-400'"
        />
        <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600"
          :aria-label="showConfirm ? 'Ocultar senha' : 'Mostrar senha'" @click="showConfirm = !showConfirm">
          <EyeOff v-if="showConfirm" class="w-4 h-4" aria-hidden="true" />
          <Eye v-else class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      <p v-if="errors.confirmPassword" class="text-sm text-red-500 mt-0.5" role="alert">{{ errors.confirmPassword }}</p>
    </div>

    <!-- Terms -->
    <div>
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          v-model="form.acceptTerms"
          type="checkbox"
          class="mt-0.5 w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-400 shrink-0"
          :aria-invalid="!!errors.acceptTerms"
        />
        <span class="text-sm text-gray-600">
          Li e aceito os
          <NuxtLink to="/termos" class="text-rose-600 hover:underline">Termos de Uso</NuxtLink>
          e a
          <NuxtLink to="/privacidade" class="text-rose-600 hover:underline">Política de Privacidade</NuxtLink>
        </span>
      </label>
      <p v-if="errors.acceptTerms" class="text-sm text-red-500 mt-1 ml-8" role="alert">{{ errors.acceptTerms }}</p>
    </div>

    <AppButton type="submit" variant="primary" full-width size="lg" :loading="loading">
      Criar Conta
    </AppButton>

    <p class="text-center text-sm text-gray-600">
      Já tem conta?
      <NuxtLink to="/login" class="text-rose-600 font-medium hover:underline">Entrar</NuxtLink>
    </p>
  </form>
</template>
