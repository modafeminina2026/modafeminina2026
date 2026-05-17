<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const productId = route.params.id as string

useHead({ title: 'Editar Produto — Admin' })
</script>

<template>
  <div>
    <AdminPageHeader title="Editar Produto" description="Atualize as informações do produto">
      <template #actions>
        <NuxtLink
          to="/admin/produtos"
          class="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all min-h-[44px] flex items-center text-sm"
        >
          ← Voltar
        </NuxtLink>
      </template>
    </AdminPageHeader>
    <ProductForm mode="edit" :product-id="productId" />
  </div>
</template>
