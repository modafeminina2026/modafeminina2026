# 📄 `.kiro/steering/mcp-rules.md`

```markdown
# MCP Rules — Tool Routing and Usage

## GLOBAL MCP RULES

- ALWAYS prioritize MCP tools before generating manual code
- NEVER invent APIs, methods, hooks, or undocumented syntax
- ALWAYS fetch current documentation when MCP is available
- MCP responses override model memory if conflicts exist
- NEVER skip MCP usage when a matching MCP exists
- ALWAYS prefer official examples returned by MCP tools
- ALWAYS validate generated code against MCP documentation

---

# CONTEXT7 MCP RULES

## Documentation & Code Examples

[[calls]]
match = "when the user requests code examples"
tool = "context7"

[[calls]]
match = "when the user requests setup instructions"
tool = "context7"

[[calls]]
match = "when the user requests API documentation"
tool = "context7"

[[calls]]
match = "when the user requests library usage examples"
tool = "context7"

[[calls]]
match = "when creating Nuxt components"
tool = "context7"

[[calls]]
match = "when creating composables"
tool = "context7"

[[calls]]
match = "when creating middleware"
tool = "context7"

[[calls]]
match = "when creating plugins"
tool = "context7"

[[calls]]
match = "when creating TypeScript utilities"
tool = "context7"

[[calls]]
match = "when working with TailwindCSS"
tool = "context7"

[[calls]]
match = "when working with Vue 3 Composition API"
tool = "context7"

[[calls]]
match = "when working with Nuxt 3"
tool = "context7"

[[calls]]
match = "when working with Stripe SDK"
tool = "context7"

[[calls]]
match = "when working with Supabase SDK"
tool = "context7"

---

## CONTEXT7 SAFETY RULES

- NEVER generate outdated syntax without checking Context7
- NEVER assume package versions
- ALWAYS verify latest Nuxt 3 conventions
- ALWAYS verify latest Vue Composition API syntax
- ALWAYS verify TypeScript compatibility
- ALWAYS prefer official Context7 examples over memory

---

# SHADCN-VUE MCP RULES

## UI Component Generation

[[calls]]
match = "when creating buttons"
tool = "shadcn-vue"

[[calls]]
match = "when creating forms"
tool = "shadcn-vue"

[[calls]]
match = "when creating dialogs"
tool = "shadcn-vue"

[[calls]]
match = "when creating modals"
tool = "shadcn-vue"

[[calls]]
match = "when creating drawers"
tool = "shadcn-vue"

[[calls]]
match = "when creating sheets"
tool = "shadcn-vue"

[[calls]]
match = "when creating dropdown menus"
tool = "shadcn-vue"

[[calls]]
match = "when creating responsive navigation"
tool = "shadcn-vue"

[[calls]]
match = "when creating cards"
tool = "shadcn-vue"

[[calls]]
match = "when creating carousels"
tool = "shadcn-vue"

[[calls]]
match = "when creating mobile navigation"
tool = "shadcn-vue"

[[calls]]
match = "when creating loading skeletons"
tool = "shadcn-vue"

[[calls]]
match = "when creating responsive layouts"
tool = "shadcn-vue"

[[calls]]
match = "when creating checkout UI"
tool = "shadcn-vue"

[[calls]]
match = "when creating dashboard UI"
tool = "shadcn-vue"

---

## SHADCN-VUE UI RULES

- ALWAYS prefer shadcn-vue components over custom UI when available
- ALWAYS use accessible components
- ALWAYS maintain mobile-first responsiveness
- NEVER recreate components that already exist in shadcn-vue
- ALWAYS use consistent spacing and sizing
- ALWAYS preserve accessibility attributes
- ALWAYS keep touch targets >= 44px

---

# SUPABASE MCP RULES

## Database Operations

[[calls]]
match = "when creating database tables"
tool = "supabase"

[[calls]]
match = "when creating migrations"
tool = "supabase"

[[calls]]
match = "when creating RLS policies"
tool = "supabase"

[[calls]]
match = "when creating authentication flows"
tool = "supabase"

[[calls]]
match = "when working with Supabase Auth"
tool = "supabase"

[[calls]]
match = "when creating storage buckets"
tool = "supabase"

[[calls]]
match = "when generating SQL"
tool = "supabase"

[[calls]]
match = "when creating realtime features"
tool = "supabase"

[[calls]]
match = "when creating protected queries"
tool = "supabase"

[[calls]]
match = "when implementing user profiles"
tool = "supabase"

[[calls]]
match = "when implementing carts, orders, or checkout persistence"
tool = "supabase"

[[calls]]
match = "when creating backend CRUD operations"
tool = "supabase"

---

## SUPABASE SECURITY RULES

- NEVER disable RLS
- ALWAYS generate policies for every table
- ALWAYS validate auth rules
- NEVER expose service_role_key on frontend
- ALWAYS separate frontend and backend permissions
- ALWAYS prefer server-side sensitive operations
- ALWAYS validate ownership before updates or deletes
- ALWAYS optimize queries for mobile performance

---

# MCP PRIORITY ORDER

1. context7 → official documentation and framework syntax
2. shadcn-vue → UI and responsive components
3. supabase → database, auth, policies, storage
4. internal knowledge → fallback only if MCP unavailable

---

# ANTI-HALLUCINATION RULES

- NEVER generate undocumented APIs
- NEVER invent hooks or framework features
- NEVER guess package behavior
- ALWAYS fetch documentation before implementation
- ALWAYS trust MCP documentation over memory
- ALWAYS verify syntax compatibility before generating code
```
