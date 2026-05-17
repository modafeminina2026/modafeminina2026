```markdown
# Database Integrity Steering — Validação de Conexões

## REGRA ABSOLUTA DE INTEGRIDADE DE DADOS

Toda vez que você criar ou modificar:
- Uma tabela no banco de dados
- Um composable que faz queries
- Um server route que interage com dados
- Um componente que exibe dados

Você DEVE verificar esta checklist:

## ✅ CHECKLIST DE INTEGRIDADE (OBRIGATÓRIA)

### 1. FOREIGN KEYS (Chaves Estrangeiras)
Antes de criar qualquer query, verifique:

- [ ] Toda FK está declarada na criação da tabela?
- [ ] Toda FK tem ON DELETE CASCADE ou ON DELETE SET NULL apropriado?
- [ ] Toda FK tem índice criado (o Supabase cria automaticamente)?

**Exemplo correto:**
```sql
-- Table: order_items
- order_id: uuid (FK → orders.id ON DELETE CASCADE)
- product_id: uuid (FK → products.id ON DELETE RESTRICT)
```

**Validação no código:**
Ao fazer JOIN, SEMPRE verifique se a FK existe:
```typescript
// ❌ ERRADO - não valida se order_id existe
const { data } = await supabase
  .from('order_items')
  .select('*')

// ✅ CORRETO - valida conexão com orders
const { data } = await supabase
  .from('order_items')
  .select(`
    *,
    orders!order_id (
      id,
      order_number,
      status
    ),
    products!product_id (
      id,
      name,
      images
    )
  `)
```

### 2. QUERIES COM JOIN
Ao fazer SELECT com relacionamentos:

- [ ] Uso o operador `!` para especificar a FK? (ex: `orders!order_id`)
- [ ] Selecionei APENAS os campos necessários? (nunca `*` em JOINs)
- [ ] Tratei o caso de FK nula com `.nullable()` se aplicável?
- [ ] Verifiquei se a tabela relacionada existe?

**Template obrigatório:**
```typescript
const { data, error } = await supabase
  .from('tabela_principal')
  .select(`
    id,
    campo1,
    campo2,
    tabela_relacionada!foreign_key_column (
      id,
      campo_necessario1,
      campo_necessario2
    )
  `)
  .eq('id', id)
  .single()

if (error) {
  // tratar erro de conexão
}

if (!data) {
  // tratar caso não encontrado
}
```

### 3. INSERTS E UPDATES
Ao inserir ou atualizar dados:

- [ ] Validei que todas as FKs existem ANTES de inserir?
- [ ] Tratei o erro de FK violation (código 23503)?
- [ ] Usei transações quando necessário (múltiplas inserções relacionadas)?

**Exemplo:**
```typescript
// ✅ CORRETO - valida FK antes de inserir
// 1. Verificar se product_id existe
const { data: product } = await supabase
  .from('products')
  .select('id')
  .eq('id', product_id)
  .single()

if (!product) {
  throw createError({
    statusCode: 404,
    message: 'Produto não encontrado'
  })
}

// 2. Agora sim inserir order_item
const { data: item, error } = await supabase
  .from('order_items')
  .insert({
    order_id,
    product_id, // FK validada
    quantity
  })
```

### 4. DELETES
Ao deletar registros:

- [ ] Verifiquei o comportamento ON DELETE da FK?
- [ ] Se CASCADE: avisei o usuário que dados relacionados serão deletados?
- [ ] Se RESTRICT: tratei o erro quando há dados relacionados?
- [ ] Considerei soft delete (is_active=false) em vez de hard delete?

**Exemplo:**
```typescript
// Deletar produto que pode ter order_items
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', product_id)

if (error) {
  // Erro 23503 = FK violation (há pedidos com esse produto)
  if (error.code === '23503') {
    throw createError({
      statusCode: 409,
      message: 'Não é possível deletar produto com pedidos existentes. Desative-o.'
    })
  }
}
```

### 5. RLS (Row Level Security)
Ao criar policies:

- [ ] Policy permite SELECT com JOIN nas tabelas relacionadas?
- [ ] Policy valida ownership nas tabelas relacionadas (ex: order.user_id = auth.uid())?
- [ ] Testei se SELECT com JOIN funciona para usuários normais?

**Exemplo de policy que permite JOIN:**
```sql
-- Policy em order_items que permite JOIN com orders
CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);
```

### 6. TIPOS TYPESCRIPT
Ao criar interfaces/types:

- [ ] Interface reflete EXATAMENTE o schema da tabela?
- [ ] Campos relacionados (JOINs) estão tipados corretamente?
- [ ] Campos nullable estão marcados como `| null`?
- [ ] FKs estão tipadas como UUID?

**Exemplo:**
```typescript
// Schema da tabela order_items
interface OrderItem {
  id: string // uuid
  order_id: string // FK → orders.id
  product_id: string // FK → products.id
  quantity: number
  unit_price: number
  size: string | null
  color: string | null
  created_at: string
}

// Com relações (para queries com JOIN)
interface OrderItemWithRelations extends OrderItem {
  orders: {
    id: string
    order_number: string
    status: string
  }
  products: {
    id: string
    name: string
    images: string[]
  }
}
```
######🚨 PROTOCOLO DE VALIDAÇÃO ANTES DE MARCAR TAREFA CONCLUÍDA

Antes de dizer "✅ TAREFA X CONCLUÍDA", execute esta validação:

### Passo 1: Listar todas as tabelas envolvidas
Exemplo:
- Criei/modifiquei: `admin_users`, `activity_logs`
- Tabelas relacionadas: `users` (via user_id)

### Passo 2: Para cada FK, verificar:
```
FK: admin_users.user_id → users.id
- Declarada na criação da tabela? ✅
- ON DELETE apropriado? ✅ (CASCADE)
- Queries usam JOIN correto? ✅
- Policy RLS permite JOIN? ✅
```

### Passo 3: Testar queries no SQL Editor
Copiar a query exata do código e rodar no Supabase SQL Editor:
```sql
SELECT 
  admin_users.*,
  users.email,
  users.full_name
FROM admin_users
LEFT JOIN users ON users.id = admin_users.user_id;
```

Se retornar dados corretamente, FK está conectada ✅

### Passo 4: Testar RLS
No SQL Editor, simular como usuário normal:
```sql
SET request.jwt.claims.sub = 'user-uuid-aqui';

SELECT * FROM order_items
LEFT JOIN orders ON orders.id = order_items.order_id;
```

Se retornar apenas dados do usuário, RLS está correto ✅

## ❌ ERROS COMUNS E COMO EVITAR

| Erro | Causa | Solução |
|------|-------|---------|
| `null` em JOIN | FK não especificada com `!` | Usar `orders!order_id(...)` |
| Policy nega JOIN | RLS não permite acesso à tabela relacionada | Criar policy na tabela relacionada |
| FK violation (23503) | Tentou inserir com FK inexistente | Validar FK existe antes de insert |
| `undefined` em campo de relação | TypeScript não espera relação | Atualizar interface com tipo da relação |
| Dados duplicados em JOIN | LEFT JOIN sem filtro | Usar INNER JOIN ou adicionar filtro |

## 🎯 QUANDO CRIAR NOVA TABELA

Siga esta ordem SEMPRE:

1. **Desenhar relacionamentos no papel/mente**
   - Quais FKs vai ter?
   - Para qual tabela apontam?
   - ON DELETE será CASCADE, RESTRICT ou SET NULL?

2. **Criar tabela com FKs declaradas**
3. **Criar índices nas FKs** (se não automático)
4. **Criar RLS policies** (incluindo para JOINs)
5. **Testar queries com JOIN no SQL Editor**
6. **Criar interface TypeScript** com relações
7. **Implementar no código**
8. **Testar end-to-end**

## 📋 TEMPLATE DE VALIDAÇÃO (copie e preencha)

Ao completar tarefa que mexe com banco:

```
## Validação de Integridade - Tarefa [N]

### Tabelas criadas/modificadas:
- [ ] `tabela1` — descrição
- [ ] `tabela2` — descrição

### Foreign Keys:
- [ ] `tabela1.fk_campo` → `tabela_relacionada.id` (ON DELETE CASCADE)
  - Declarada: ✅/❌
  - Queries usam JOIN correto: ✅/❌
  - RLS permite acesso: ✅/❌
  - TypeScript tipado: ✅/❌

### Queries testadas no SQL Editor:
```sql
-- Copie e cole a query principal aqui
-- Teste com usuário normal (SET request.jwt.claims.sub)
```

### Todos os checkpoints da checklist acima: ✅

Somente após tudo ✅: "✅ TAREFA [N] CONCLUÍDA E VALIDADA"
```

---

