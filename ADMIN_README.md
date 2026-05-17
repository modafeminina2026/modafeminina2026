# 🔐 Painel Admin — Lover's Brasileiras

## Acesso

URL: `http://localhost:3000/admin/login`

---

## 1. Criar o Primeiro Admin (Setup Inicial)

### Passo 1 — Adicionar variável de ambiente

No arquivo `.env`, adicione:
```env
ADMIN_SETUP_KEY=sua-chave-secreta-aqui
```

### Passo 2 — Chamar a rota de setup

```bash
curl -X POST http://localhost:3000/api/admin/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@loversbrasileiras.com.br",
    "password": "SuaSenhaForte123!",
    "setup_key": "sua-chave-secreta-aqui"
  }'
```

Ou via PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/auth/setup" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@loversbrasileiras.com.br","password":"SuaSenhaForte123!","setup_key":"sua-chave-secreta-aqui"}'
```

### Passo 3 — Deletar o arquivo de setup

```
DELETE: server/api/admin/auth/setup.post.ts
```

⚠️ **IMPORTANTE**: Delete este arquivo após criar o primeiro admin!

---

## 2. Adicionar Novos Admins

Após o setup, use o SQL Editor do Supabase:

```sql
-- 1. Primeiro crie o usuário no Supabase Auth (Dashboard → Authentication → Users)
-- 2. Copie o UUID do usuário criado
-- 3. Execute:

INSERT INTO admin_users (user_id, role, permissions, is_active)
VALUES (
  'UUID-DO-USUARIO-AQUI',
  'admin',                    -- 'super_admin', 'admin', ou 'moderator'
  '["product.create","product.update","order.view","order.update"]'::jsonb,
  true
);
```

### Roles disponíveis:
| Role | Acesso |
|------|--------|
| `super_admin` | Acesso total a tudo |
| `admin` | Produtos, pedidos, configurações |
| `moderator` | Apenas visualização |

### Permissões disponíveis:
```
product.create, product.update, product.delete
order.view, order.update
user.view
settings.update
logs.view
```

---

## 3. Gerenciar Produtos

1. Acesse `/admin/produtos`
2. Clique em **"Novo Produto"**
3. Preencha:
   - Nome, slug (gerado automaticamente), descrição
   - Categoria, preço, estoque
   - Tamanhos e cores disponíveis
   - Marque "Ativo" para aparecer no site
   - Marque "Destaque" para aparecer na home
4. Faça upload das fotos (drag-and-drop, máx 5MB cada)
5. Clique em **"Criar Produto"**

### Upload de Imagens:
- Arraste as imagens para a área de upload
- A primeira imagem é automaticamente a principal
- Clique na estrela ⭐ para mudar a imagem principal
- Arraste para reordenar
- Clique no X para remover

---

## 4. Gerenciar Pedidos de Retirada

1. Acesse `/admin/pedidos`
2. Filtre por **"Retirada"** no tipo de entrega
3. Clique no pedido para ver detalhes
4. Quando o pedido estiver pronto:
   - Clique em **"✅ Marcar como Pronto"**
   - O status muda para `ready_for_pickup`
   - Notifique o cliente com o código de 4 dígitos
5. Quando o cliente retirar:
   - Verifique o código de 4 dígitos apresentado
   - Clique em **"📦 Marcar como Retirado"**

---

## 5. Exportar Dados

- Acesse `/admin/pedidos`
- Clique em **"Exportar CSV"**
- O arquivo será baixado com todos os pedidos

---

## 6. Logs de Atividade

- Acesse `/admin/logs`
- Todas as ações são registradas automaticamente
- Filtros por ação, recurso e data
- **Não é possível deletar logs** (auditoria)

---

## 7. Configurações

- Acesse `/admin/configuracoes`
- Configure:
  - Endereço da loja (exibido no site)
  - Horário de funcionamento
  - Custo do frete
  - Limite de alerta de estoque baixo

---

## 8. Segurança

- ✅ Todas as rotas `/api/admin/*` exigem autenticação
- ✅ Rate limiting: 100 req/min por IP
- ✅ Todas as ações são logadas em `activity_logs`
- ✅ RLS habilitado em todas as tabelas
- ✅ Chaves secretas nunca expostas no frontend
- ✅ CPF criptografado com AES-256-GCM

---

## 9. Estrutura de Arquivos

```
app/
├── layouts/admin.vue              # Layout do admin (dark mode)
├── pages/admin/
│   ├── index.vue                  # Dashboard
│   ├── login.vue                  # Login
│   ├── produtos/
│   │   ├── index.vue              # Lista de produtos
│   │   ├── novo.vue               # Criar produto
│   │   └── [id].vue               # Editar produto
│   ├── pedidos/
│   │   ├── index.vue              # Lista de pedidos
│   │   └── [id].vue               # Detalhes do pedido
│   ├── logs.vue                   # Logs de atividade
│   └── configuracoes.vue          # Configurações
├── components/admin/
│   ├── AdminSidebar.vue
│   ├── AdminTopBar.vue
│   ├── AdminPageHeader.vue
│   ├── AdminStats.vue
│   ├── ProductsTable.vue
│   ├── ProductForm.vue
│   ├── ImageUploader.vue
│   └── OrdersTable.vue
├── composables/useAdminAuth.ts
└── middleware/admin.ts

server/
├── middleware/admin-auth.ts       # Verifica auth em /api/admin/*
├── utils/admin.ts                 # requireAdmin, logAdminAction
└── api/admin/
    ├── auth/login.post.ts
    ├── auth/me.get.ts
    ├── auth/setup.post.ts         # DELETE após setup!
    ├── products/                  # CRUD de produtos
    ├── orders/                    # Gestão de pedidos
    ├── upload/image.post.ts       # Upload de imagens
    ├── stats/                     # Dashboard stats
    ├── logs.get.ts
    └── settings/                  # Configurações
```
