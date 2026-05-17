---
name: Create Composable
description: Process for creating composables inside app/composables/
---

# Create Composable

## 1. PRE-CHECK
- Verify if a similar composable already exists
- Confirm shared logic necessity

## 2. TEMPLATE

```typescript
interface MyType {
  // explicit types
}

export const useMyComposable = () => {
  const state = useState<MyType[]>('unique-key', () => [])

  const myFunction = async () => {
    try {
      // logic
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return {
    state: readonly(state),
    myFunction,
  }
}
```