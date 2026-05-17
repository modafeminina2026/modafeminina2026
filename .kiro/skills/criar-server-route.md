---
name: Create Server Route API
description: Process for creating endpoints inside server/api/
---

# Create Server Route

## 1. PRE-CHECK
- Verify if the route already exists
- Define correct HTTP method
- Check if authentication is required

## 2. REQUIRED TEMPLATE

```typescript
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const body = await readBody(event)

  const client = await serverSupabaseClient(event)

  try {
    const { data, error } = await client
      .from('table')
      .select('*')

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error(error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
```