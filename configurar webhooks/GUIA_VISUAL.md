# 🎯 Guia Visual - Webhook Stripe

## 1️⃣ Fluxo de Funcionamento

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE NUXT                             │
│  (Seu app de presente para namorada)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Clica em "Pagar"
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    STRIPE                                   │
│  (Processa o pagamento)                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Pagamento bem-sucedido
                     │ Envia webhook
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              SEU SERVIDOR WEBHOOK                           │
│  (localhost:4242/webhook)                                   │
│  ✅ Verifica assinatura                                     │
│  ✅ Processa evento                                         │
│  ✅ Salva no banco de dados                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Salva dados
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE                                   │
│  (Seu banco de dados)                                       │
│  Tabela: payments                                           │
└─────────────────────────────────────────────────────────────┘
```

## 2️⃣ Estrutura do Webhook

```
┌─────────────────────────────────────────────────────────────┐
│                  WEBHOOK REQUEST                            │
├─────────────────────────────────────────────────────────────┤
│ Headers:                                                    │
│  • stripe-signature: t=...,v1=...                          │
│  • content-type: application/json                          │
│                                                             │
│ Body:                                                       │
│  {                                                          │
│    "id": "evt_...",                                        │
│    "type": "payment_intent.succeeded",                     │
│    "data": {                                               │
│      "object": {                                           │
│        "id": "pi_...",                                     │
│        "amount": 5000,                                     │
│        "currency": "brl",                                  │
│        "customer": "cus_...",                              │
│        "status": "succeeded"                               │
│      }                                                      │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

## 3️⃣ Processamento do Webhook

```
┌─────────────────────────────────────────────────────────────┐
│  1. RECEBER WEBHOOK                                         │
│     POST /webhook                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. VERIFICAR ASSINATURA                                    │
│     stripe.webhooks.constructEvent(                         │
│       body, signature, secret                               │
│     )                                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    ✅ VÁLIDO                 ❌ INVÁLIDO
        │                         │
        │                    Retorna 400
        │                    Log erro
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  3. PROCESSAR EVENTO                                        │
│     switch(event.type) {                                    │
│       case 'payment_intent.succeeded':                      │
│         handlePaymentSucceeded(event)                       │
│     }                                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. SALVAR NO BANCO                                         │
│     supabase.from('payments').insert({                      │
│       stripe_payment_id: pi_...,                            │
│       amount: 5000,                                         │
│       status: 'succeeded'                                   │
│     })                                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. RETORNAR 200                                            │
│     response.send()                                         │
│     ✅ Webhook processado com sucesso                       │
└─────────────────────────────────────────────────────────────┘
```

## 4️⃣ Tipos de Eventos

```
┌──────────────────────────────────────────────────────────────┐
│ EVENTO                          │ SIGNIFICADO                │
├──────────────────────────────────────────────────────────────┤
│ payment_intent.succeeded        │ ✅ Pagamento bem-sucedido  │
│ payment_intent.payment_failed   │ ❌ Pagamento falhou       │
│ charge.succeeded                │ ✅ Cobrança bem-sucedida   │
│ charge.failed                   │ ❌ Cobrança falhou        │
│ payment_method.attached         │ 💳 Método adicionado      │
└──────────────────────────────────────────────────────────────┘
```

## 5️⃣ Testando Localmente

```
Terminal 1: Stripe CLI
┌─────────────────────────────────────────────────────────────┐
│ $ stripe login                                              │
│ $ stripe listen --forward-to localhost:4242/webhook        │
│                                                             │
│ > Ready! Your webhook signing secret is: whsec_test_...   │
│ > Forwarding to http://localhost:4242/webhook              │
└─────────────────────────────────────────────────────────────┘

Terminal 2: Seu Servidor
┌─────────────────────────────────────────────────────────────┐
│ $ npm start                                                 │
│                                                             │
│ 🚀 Webhook server running on port 4242                     │
└─────────────────────────────────────────────────────────────┘

Terminal 3: Simular Evento
┌─────────────────────────────────────────────────────────────┐
│ $ stripe trigger payment_intent.succeeded                   │
│                                                             │
│ > Sending payment_intent.succeeded event...                │
└─────────────────────────────────────────────────────────────┘

Terminal 2: Logs do Servidor
┌─────────────────────────────────────────────────────────────┐
│ 📨 Webhook received at 2026-05-16T10:30:45.123Z            │
│ ✅ Webhook signature verified                              │
│ ✅ PaymentIntent for 2000 was successful!                  │
│    ID: pi_1234567890                                       │
│    Customer: cus_1234567890                                │
│ ✅ Event processed successfully                            │
└─────────────────────────────────────────────────────────────┘
```

## 6️⃣ Integração com Supabase

```
┌─────────────────────────────────────────────────────────────┐
│ TABELA: payments                                            │
├─────────────────────────────────────────────────────────────┤
│ id (BIGSERIAL)                                              │
│ stripe_payment_id (TEXT UNIQUE)                             │
│ charge_id (TEXT)                                            │
│ customer_id (TEXT)                                          │
│ amount (INTEGER)                                            │
│ currency (TEXT)                                             │
│ status (TEXT)                                               │
│ error_message (TEXT)                                        │
│ metadata (JSONB)                                            │
│ created_at (TIMESTAMP)                                      │
│ updated_at (TIMESTAMP)                                      │
└─────────────────────────────────────────────────────────────┘

Webhook → Supabase
┌─────────────────────────────────────────────────────────────┐
│ supabase                                                    │
│   .from('payments')                                         │
│   .insert({                                                 │
│     stripe_payment_id: 'pi_...',                            │
│     amount: 5000,                                           │
│     currency: 'brl',                                        │
│     customer_id: 'cus_...',                                 │
│     status: 'succeeded'                                     │
│   })                                                        │
└─────────────────────────────────────────────────────────────┘
```

## 7️⃣ Segurança

```
┌─────────────────────────────────────────────────────────────┐
│ VERIFICAÇÃO DE ASSINATURA                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Stripe envia:                                               │
│  • Webhook body (dados do evento)                           │
│  • stripe-signature header (assinatura)                     │
│                                                             │
│ Seu servidor:                                               │
│  1. Pega o secret do .env                                   │
│  2. Usa stripe.webhooks.constructEvent()                    │
│  3. Verifica se a assinatura é válida                       │
│  4. Se válida → processa evento                             │
│  5. Se inválida → rejeita (400)                             │
│                                                             │
│ Isso garante que:                                           │
│  ✅ O evento veio do Stripe                                 │
│  ✅ Não foi modificado no caminho                           │
│  ✅ Não é um ataque malicioso                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 8️⃣ Checklist de Deployment

```
LOCAL ✅
├─ npm install
├─ npm run setup (ou editar .env)
├─ npm start
├─ stripe listen --forward-to localhost:4242/webhook
└─ stripe trigger payment_intent.succeeded

STAGING 🔄
├─ Deploy para staging
├─ Criar webhook no Stripe Dashboard (staging)
├─ Usar test API keys
├─ Testar com eventos reais
└─ Monitorar logs

PRODUÇÃO 🚀
├─ Deploy para produção
├─ Criar webhook no Stripe Dashboard (produção)
├─ Usar production API keys
├─ Atualizar URL do webhook
├─ Testar com pequena transação
├─ Monitorar entregas de webhook
└─ Configurar alertas
```

## 9️⃣ Troubleshooting Rápido

```
❌ Webhook não recebe eventos?
   ✅ Verifique se Stripe CLI está rodando
   ✅ Verifique se servidor está na porta 4242
   ✅ Verifique se está logado no Stripe

❌ Erro de verificação de assinatura?
   ✅ Copie o secret correto do CLI
   ✅ Reinicie o servidor após atualizar .env
   ✅ Verifique se .env está no diretório raiz

❌ Dados não salvam no banco?
   ✅ Verifique conexão com Supabase
   ✅ Verifique schema da tabela
   ✅ Verifique permissões do banco
```

## 🔟 Próximos Passos

```
1. Leia README.md
   └─ Visão geral rápida

2. Leia TESTING.md
   └─ Teste localmente

3. Leia INTEGRATION.md
   └─ Integre com Supabase e Nuxt

4. Leia SECURITY.md
   └─ Revise segurança antes de produção

5. Implemente handlers
   └─ Salve eventos no banco
   └─ Envie emails
   └─ Processe pedidos

6. Deploy
   └─ Staging
   └─ Produção
```

---

**Você está pronto para começar!** 🎉

Comece com: `npm start`
