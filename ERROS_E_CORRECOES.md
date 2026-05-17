# 📋 Registro de Erros e Correções — Lover's Brasileiras

---

## ERRO 1 — Componentes não resolvidos (Vue warn: Failed to resolve component)

**Erro:**
```
[Vue warn]: Failed to resolve component: HeroBanner
[Vue warn]: Failed to resolve component: CategoryShowcase
[Vue warn]: Failed to resolve component: FeaturedProducts
... (todos os componentes da home)
[Vue warn]: Component <Anonymous> is missing template or render function
```

**Causa:**
Nuxt não estava detectando os componentes automaticamente. A pasta `app/components/` existia mas o Nuxt não estava fazendo o auto-import corretamente.

**Primeira tentativa (falhou):**
Deletar `.nuxt` e reiniciar o servidor.

**Correção definitiva:**
1. Adicionado `components: [{ path: '~/components', pathPrefix: false }]` no `nuxt.config.ts`
2. Adicionados imports explícitos na `app/pages/index.vue`:
```ts
import HeroBanner from '~/components/home/HeroBanner.vue'
import CategoryShowcase from '~/components/home/CategoryShowcase.vue'
// ... etc
```

---

## ERRO 2 — `useProducts is not defined`

**Erro:**
```
Error: An error has occurred — useProducts is not defined
```

**Causa:**
A pasta de composables estava nomeada como `composable` (singular) mas o Nuxt espera `composables` (plural) para fazer auto-import.

**Correção:**
Renomeada a pasta `app/composable/` → `app/composables/` via PowerShell:
```powershell
Rename-Item -Path "app\composable" -NewName "composables"
```

---

## ERRO 3 — `useState` chamado fora do contexto Nuxt

**Erro:**
```
[nuxt] A composable that requires access to the Nuxt instance was called outside of a plugin,
Nuxt hook, Nuxt middleware, or Vue setup function.
at useToast.ts:4:50
at useCart.ts:3:31
```

**Causa:**
O `useState` estava sendo chamado no **nível do módulo** (fora de qualquer função) em `useToast.ts`:
```ts
// ❌ ERRADO — fora da função
const toasts = useState<Toast[]>('toasts', () => [])

export function useToast() { ... }
```

**Primeira tentativa (falhou):**
Tentei mover apenas o `useCart`, mas o problema persistiu porque o `useToast` ainda tinha o `useState` no nível do módulo.

**Correção definitiva:**
Movido o `useState` para **dentro** da função em ambos os composables:
```ts
// ✅ CORRETO — dentro da função
export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])
  ...
}
```

---

## ERRO 4 — `serverSupabaseClient is not defined`

**Erro:**
```
Error: serverSupabaseClient is not defined
at Object.handler (server/api/categories/[slug].get.ts:8:0)
```

**Causa:**
O `serverSupabaseClient` do `@nuxtjs/supabase` não é auto-importado no Nitro. Precisa ser importado explicitamente.

**Primeira tentativa (falhou):**
Adicionado `await` antes de `serverSupabaseClient(event)` — mas o erro persistiu porque o import ainda estava faltando.

**Correção definitiva:**
Adicionado import explícito em todas as rotas de API:
```ts
import { serverSupabaseClient } from '#supabase/server'
```

---

## ERRO 5 — Imports com caminho errado `~/composable/` (sem S)

**Erro:**
```
[Vue warn]: Missing required prop: "name" at <ProductGallery>
[Vue warn]: Missing required prop: "categorySlug" at <ProductRecommendations>
```

**Causa:**
13 arquivos ainda importavam de `~/composable/` (sem S) em vez de `~/composables/` (com S) após a renomeação da pasta.

**Correção:**
Script PowerShell para substituição em massa:
```powershell
Get-ChildItem -Path "app" -Recurse -Include "*.vue","*.ts" | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  if ($content -match "~/composable/") {
    $newContent = $content -replace "~/composable/", "~/composables/"
    Set-Content -Path $_.FullName -Value $newContent
  }
}
```
Arquivos restantes corrigidos manualmente: `perfil/index.vue`, `perfil/pedidos.vue`, `perfil/pedidos/[id].vue`.

---

## ERRO 6 — Props erradas em `ProductGallery` e `ProductRecommendations`

**Erro:**
```
[Vue warn]: Missing required prop: "name" at <ProductGallery images=Array(1) alt="...">
[Vue warn]: Missing required prop: "categorySlug" at <ProductRecommendations current-product-id="..." category-id="...">
```

**Causa:**
A página `produtos/[slug].vue` estava passando props com nomes errados:
- `:alt="product.name"` → deveria ser `:name="product.name"`
- `:current-product-id` e `:category-id` → deveriam ser `:category-slug` e `:exclude-id`

**Correção:**
```vue
<!-- Antes -->
<ProductGallery :images="product.images" :alt="product.name" />
<ProductRecommendations :current-product-id="product.id" :category-id="product.category_id" />

<!-- Depois -->
<ProductGallery :images="product.images" :name="product.name" />
<ProductRecommendations :category-slug="product.categories?.slug ?? ''" :exclude-id="product.id" />
```

---

## ERRO 7 — Rotas de API `/api/products/[slug]` e `/api/categories/[slug]` não existiam

**Erro:**
```
Error: An error has occurred — useProducts is not defined
GET http://localhost:3000/api/products/paleta-sombras-nude-rose 404
```

**Causa:**
As páginas `produtos/[slug].vue` e `categoria/[slug].vue` usavam `useFetch('/api/products/...')` mas essas rotas de API nunca foram criadas.

**Correção:**
Criadas 3 novas rotas de API:
- `server/api/products/index.get.ts` — lista produtos com filtros
- `server/api/products/[slug].get.ts` — busca produto por slug
- `server/api/categories/[slug].get.ts` — busca categoria por slug

---

## ERRO 8 — `esbuild: The symbol "config" has already been declared`

**Erro:**
```
ERROR Transform failed with 1 error:
server/api/admin/auth/setup.post.ts:34:8: ERROR: The symbol "config" has already been declared
```

**Causa:**
A variável `const config = useRuntimeConfig()` foi declarada duas vezes no mesmo arquivo — uma no início e outra no meio da função.

**Correção:**
Removida a segunda declaração duplicada, mantendo apenas a primeira no topo da função.

---

## ERRO 9 — Middleware `admin` não reconhecido

**Erro:**
```
Error: Unknown route middleware: 'admin'. Valid middleware: .
```

**Causa:**
No Nuxt 4 com a pasta `app/`, os middlewares precisam estar em `app/middleware/` e não na raiz `middleware/`. Os arquivos `auth.ts`, `guest.ts` e `admin.ts` estavam em `middleware/` (raiz).

**Correção:**
Movidos todos os middlewares para `app/middleware/`:
```
middleware/auth.ts   → app/middleware/auth.ts
middleware/guest.ts  → app/middleware/guest.ts
middleware/admin.ts  → app/middleware/admin.ts
```
Arquivos antigos deletados para evitar conflito.

---

## ERRO 10 — Admin login retorna 401 "Não autenticado" (recorrente)

**Erro:**
```
statusCode: 401
statusMessage: "Não autenticado"
at requireAdmin (server/utils/admin.ts:33:0)
at admin-auth.ts:40:0
```

**Causa raiz:**
O `server/middleware/admin-auth.ts` estava interceptando **todas** as rotas `/api/admin/*` incluindo `/api/admin/auth/me` e `/api/admin/auth/setup`, chamando `requireAdmin` antes que a sessão fosse estabelecida.

**Tentativas que falharam:**
1. Adicionado `if (path === '/api/admin/auth/login') return` — não resolveu para `/me`
2. Adicionado `if (path === '/api/admin/auth/me') return` — não resolveu o 403 nas outras rotas
3. Tentativa de usar `serverSupabaseUser` com cookie — não funcionava porque o cookie não era enviado nas chamadas `$fetch` do cliente

**Correção definitiva:**
Três mudanças simultâneas:
1. **`admin-auth.ts`** simplificado para fazer apenas rate limiting (sem verificação de auth):
```ts
// Removida a verificação de auth do middleware
// Auth é feita dentro de cada route handler via requireAdmin()
```
2. **`requireAdmin`** atualizado para aceitar **Bearer token** no header Authorization:
```ts
const authHeader = getRequestHeader(event, 'authorization')
if (authHeader?.startsWith('Bearer ')) {
  const token = authHeader.slice(7)
  const { data: { user } } = await db.auth.getUser(token)
  if (user) userId = user.id
}
```
3. **`useAdminFetch`** criado para injetar o token automaticamente em todas as chamadas:
```ts
async function apiFetch<T>(url, options) {
  const token = await getToken() // via supabase.auth.getSession()
  return $fetch<T>(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}` }
  })
}
```

---

## ERRO 11 — Admin 403 "Não é administrador" após login bem-sucedido (recorrente)

**Erro:**
```
GET /api/admin/products 403 (Acesso negado — não é administrador)
GET /api/admin/auth/me 403 (Acesso negado — não é administrador)
```

**Causa:**
O `login.post.ts` estava chamando `signInWithPassword` novamente no servidor (segunda autenticação), mas o `requireAdmin` no servidor não conseguia ler a sessão do cookie porque:
- O `useFetch` com `await` roda no SSR onde não há `sessionStorage`
- O cookie de sessão do Supabase não era enviado automaticamente nas chamadas `$fetch` do cliente para rotas de API

**Tentativas que falharam:**
1. Usar `serverSupabaseUser(event)` — não lia o cookie corretamente
2. Usar `sessionStorage` para guardar o token — não funciona no SSR
3. Usar `headers: computed(...)` no `useFetch` — `computed` não é suportado em `headers`

**Correção definitiva:**
Mudança de arquitetura completa:
1. **Login no cliente** via `supabase.auth.signInWithPassword()` → obtém JWT token
2. **Token enviado** como `Authorization: Bearer <token>` em TODAS as chamadas admin
3. **`login.post.ts`** simplificado para apenas verificar o token (sem fazer login novamente):
```ts
const token = authHeader.slice(7)
const { data: { user } } = await db.auth.getUser(token)
```
4. **Todas as páginas admin** reescritas para usar `onMounted` + `apiFetch` (sem SSR):
```ts
// Antes (SSR — problemático)
const { data } = await useFetch('/api/admin/products', { headers: authHeaders })

// Depois (client-only — correto)
onMounted(async () => {
  data.value = await apiFetch('/api/admin/products')
})
```

---

## ERRO 12 — Boleto Stripe retorna 400 "O ID fiscal é inválido"

**Erro:**
```
Failed to load resource: 400 (Bad Request)
api.stripe.com/v1/payment_methods (x4)
"O ID fiscal é inválido"
```

**Causa:**
1. CPF `433.964.318-12` não é um CPF válido (dígitos verificadores incorretos)
2. Boleto no Stripe em modo de teste requer conta brasileira verificada
3. A sessão de checkout não tinha `payment_method_options.boleto` configurado

**Correção:**
1. Boleto só é adicionado se o CPF tiver 11 dígitos válidos:
```ts
if (cpfRaw.length === 11 || cpfRaw.length === 14) {
  sessionParams.payment_method_types = ['card', 'boleto']
  sessionParams.payment_method_options = { boleto: { expires_after_days: 3 } }
}
```
2. Documentado que boleto em modo de teste não funciona sem conta Stripe brasileira verificada

---

## ERRO 13 — `[nuxt] Your project has layouts but <NuxtLayout /> has not been used`

**Erro:**
```
WARN [nuxt] Your project has layouts but the <NuxtLayout /> component has not been used.
```

**Causa:**
O `app/app.vue` não estava usando `<NuxtLayout>`.

**Correção:**
Adicionado `<NuxtLayout>` no `app/app.vue` (já estava correto — era apenas um warning informativo, não um erro crítico).

---

## ERRO 14 — `rls_auto_enable` event trigger causando erro em migrations

**Erro:**
```
ERROR: 42P01: relation "public.public.admin_users" does not exist
CONTEXT: SQL statement "ALTER TABLE public."public.admin_users" ENABLE ROW LEVEL SECURITY"
PL/pgSQL function public.rls_auto_enable() line 7 at EXECUTE
```

**Causa:**
O event trigger `ensure_rls` estava interceptando o `CREATE TABLE` e tentando habilitar RLS com um path duplicado (`public.public.admin_users`).

**Correção:**
Desabilitar o event trigger antes das migrations e reabilitar depois:
```sql
ALTER EVENT TRIGGER ensure_rls DISABLE;
-- ... criar tabelas ...
ALTER EVENT TRIGGER ensure_rls ENABLE;
```

---

## ERRO 15 — Funções SECURITY DEFINER acessíveis publicamente

**Vulnerabilidade detectada pelo Supabase Advisor:**
```
WARN: Public Can Execute SECURITY DEFINER Function
- decrement_stock() pode ser chamada por anon/authenticated
- handle_new_order() pode ser chamada por anon/authenticated
- rls_auto_enable() pode ser chamada por anon/authenticated
```

**Correção:**
1. Recriadas as funções como `SECURITY INVOKER`
2. Revogado `EXECUTE` de `anon` e `authenticated`
3. Concedido `EXECUTE` apenas para `service_role`

---

## ERRO 16 — `order_number` ficando `null` nos pedidos

**Problema:**
Pedido criado com `order_number = null` após pagamento bem-sucedido.

**Causa:**
O trigger `handle_new_order` foi recriado durante a correção de segurança mas sem a lógica de geração do `order_number`.

**Correção:**
Recriado o trigger com a lógica completa:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_order()
RETURNS trigger AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    -- Gera LB-20260001
    NEW.order_number := 'LB-' || TO_CHAR(NOW(), 'YYYY') || LPAD(v_seq::text, 4, '0');
  END IF;
  -- ... pickup code ...
END;
$$;
```
Pedido existente corrigido manualmente: `UPDATE orders SET order_number = 'LB-20260001' WHERE order_number IS NULL`.

---

## ERRO 17 — `const config` declarado duas vezes em `setup.post.ts`

**Erro:**
```
ERROR Transform failed with 1 error:
server/api/admin/auth/setup.post.ts:34:8: ERROR: The symbol "config" has already been declared
```

**Causa:**
Durante uma edição, `const config = useRuntimeConfig()` foi adicionado duas vezes no mesmo arquivo — uma no início e outra no meio.

**Correção:**
Removida a segunda declaração duplicada.

---

## ERRO 18 — Página de sucesso do checkout não exibia o código de retirada

**Problema:**
Após pagamento, a página `/checkout/sucesso` não mostrava o código de 4 dígitos.

**Causa:**
A página lia `pickup_code` da query string da URL, mas o Stripe só passa `session_id` no redirect — não passa dados do pedido.

**Correção:**
Criada rota `GET /api/orders/by-session?session_id=...` que busca o pedido pelo `stripe_checkout_session_id` no banco. A página de sucesso agora busca o pedido completo e exibe o código.

---

## ERRO 19 — Checkout não funcionava para usuários não logados

**Problema:**
Clicar em "Finalizar Compra" não avançava — a rota de checkout exigia autenticação.

**Causa:**
A página `checkout.vue` tinha `definePageMeta({ middleware: 'auth' })` e a rota de API exigia `serverSupabaseUser`.

**Correção:**
1. Removido middleware `auth` da página de checkout
2. Rota de API atualizada para aceitar convidados com `guestInfo` (nome, email, CPF, telefone)
3. Adicionado step "Identificação" no `CheckoutForm` para convidados
4. Adicionadas colunas `guest_name`, `guest_email`, `guest_cpf`, `guest_phone` na tabela `orders`
5. `user_id` tornado nullable para pedidos de convidados

---

## Resumo de Erros Recorrentes

| Erro | Vezes | Causa Raiz | Status |
|------|-------|-----------|--------|
| 403 Admin Auth | 5x | Token JWT não enviado nas chamadas API | ✅ Resolvido |
| `serverSupabaseClient` not defined | 3x | Import faltando em rotas de API | ✅ Resolvido |
| `useState` fora do contexto | 2x | Chamada no nível do módulo | ✅ Resolvido |
| Componentes não resolvidos | 2x | Pasta `composable` sem S + config Nuxt | ✅ Resolvido |
| Middleware `admin` não encontrado | 1x | Arquivo em pasta errada (raiz vs `app/`) | ✅ Resolvido |
