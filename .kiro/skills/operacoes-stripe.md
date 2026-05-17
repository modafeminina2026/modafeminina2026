---
name: Stripe Operations
description: Rules for implementing Stripe payments
---

# Stripe Operations

## Required separation:
- FRONTEND: only @stripe/stripe-js
- BACKEND: Stripe SDK with secret key

## Webhooks:
- ALWAYS validate signature
- Use constructEvent()

## Cards:
- NEVER store full card numbers
- Store only:
  - payment_method_id
  - brand
  - last4
  - exp_month
  - exp_year

## Flow:
1. Frontend creates checkout
2. Backend generates session
3. Stripe processes payment
4. Webhook confirms payment