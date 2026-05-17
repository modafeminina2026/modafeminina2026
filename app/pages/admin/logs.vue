<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { apiFetch } = useAdminFetch()

const filterAction = ref('')
const filterResource = ref('')
const page = ref(1)

const logs = ref<unknown[]>([])
const pagination = ref<{ total: number; totalPages: number } | null>(null)
const pending = ref(false)

async function loadLogs() {
  pending.value = true
  try {
    const q: Record<string, unknown> = { page: page.value }
    if (filterAction.value) q.action = filterAction.value
    if (filterResource.value) q.resource_type = filterResource.value
    const res = await apiFetch<{ logs: unknown[]; pagination: { total: number; totalPages: number } }>(
      `/api/admin/logs?${new URLSearchParams(q as Record<string, string>)}`
    )
    logs.value = res.logs
    pagination.value = res.pagination
  } catch { /* silently fail */ }
  finally { pending.value = false }
}

onMounted(loadLogs)
watch([filterAction, filterResource, page], loadLogs)

const actionColors: Record<string, string> = {
  create: 'text-green-400', update: 'text-blue-400', delete: 'text-red-400',
  login: 'text-purple-400', logout: 'text-gray-400', upload: 'text-amber-400',
}

function formatDate(d: unknown) {
  return new Date(d as string).toLocaleString('pt-BR')
}

useHead({ title: 'Logs de Atividade — Admin' })
</script>

<template>
  <div>
    <AdminPageHeader title="Logs de Atividade" description="Registro de todas as ações administrativas (somente leitura)" />

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <select v-model="filterAction" class="h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
        <option value="">Todas as ações</option>
        <option v-for="a in ['create','update','delete','login','logout','upload','publish','unpublish']" :key="a" :value="a">{{ a }}</option>
      </select>
      <select v-model="filterResource" class="h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
        <option value="">Todos os recursos</option>
        <option v-for="r in ['product','order','user','category','image','setting','admin_user','session']" :key="r" :value="r">{{ r }}</option>
      </select>
    </div>

    <div class="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
      <div v-if="pending" class="p-8 text-center text-gray-400">
        <div class="w-8 h-8 border-2 border-gray-600 border-t-rose-400 rounded-full animate-spin mx-auto mb-2" />
        Carregando logs...
      </div>
      <div v-else-if="!logs.length" class="p-12 text-center text-gray-400 text-sm">Nenhum log encontrado</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wide">
              <th class="px-4 py-3 text-left">Admin</th>
              <th class="px-4 py-3 text-left">Ação</th>
              <th class="px-4 py-3 text-left">Recurso</th>
              <th class="px-4 py-3 text-left">IP</th>
              <th class="px-4 py-3 text-left">Data</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700/50">
            <tr v-for="log in (logs as Record<string, unknown>[])" :key="log.id as string" class="hover:bg-gray-700/20">
              <td class="px-4 py-3 text-xs text-gray-300">
                {{ ((log.admin_users as Record<string, unknown>)?.profiles as Record<string, unknown>)?.email ?? '—' }}
              </td>
              <td class="px-4 py-3">
                <span class="text-xs font-medium" :class="actionColors[log.action as string] ?? 'text-gray-400'">{{ log.action }}</span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-400">
                {{ log.resource_type }}
                <span v-if="log.resource_id" class="text-gray-600 ml-1 font-mono">{{ (log.resource_id as string).slice(0, 8) }}</span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-500 font-mono">{{ log.ip_address ?? '—' }}</td>
              <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{{ formatDate(log.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="pagination && pagination.totalPages > 1" class="flex items-center justify-between mt-4">
      <p class="text-sm text-gray-400">{{ pagination.total }} registros</p>
      <div class="flex gap-2">
        <button :disabled="page <= 1" class="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors" @click="page--">Anterior</button>
        <span class="px-3 py-2 text-sm text-gray-400">{{ page }} / {{ pagination.totalPages }}</span>
        <button :disabled="page >= pagination.totalPages" class="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors" @click="page++">Próxima</button>
      </div>
    </div>
  </div>
</template>
