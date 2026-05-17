---
name: Supabase Operations
description: Rules for interacting with Supabase database
---

# Supabase Operations

## Frontend:
- Public read-only operations
- useSupabaseClient()

## Backend:
- Writes and sensitive operations
- serverSupabaseClient()

## Security:
- NEVER disable RLS
- Create policies for all tables

## Queries:

```typescript
.select('id, name, price, images')
```

## Mobile:
- Load small batches of data
- Use pagination
- Optimize imagesyes