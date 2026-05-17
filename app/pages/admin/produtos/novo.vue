<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Novo Produto — Admin' })
</script>

<template>
  <div>
    <AdminPageHeader title="Novo Produto" description="Adicione um novo produto à loja" />
    <ProductForm mode="create" />
  </div>
</template>
