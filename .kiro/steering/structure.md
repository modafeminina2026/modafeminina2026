# Structure Steering — Structure Rules

## EXISTING FOLDERS (DO NOT RECREATE)
- app/components/
- app/composables/
- app/pages/

## ALLOWED ACTIONS
- ONLY create files INSIDE these folders
- Create subfolders when necessary

## FORBIDDEN ACTIONS
- NEVER delete existing files without explicit permission
- NEVER recreate folders that already exist
- NEVER run project reinitialization commands
- NEVER overwrite an entire file when only partial editing is needed
- NEVER remove working imports or functions
- NEVER create files outside the defined structure

## EXPECTED STRUCTURE

app/
├── layouts/default.vue
├── components/
│   ├── layout/
│   ├── ui/
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   ├── auth/
│   └── home/
├── composables/
└── pages/

middleware/
server/
├── api/
├── middleware/
└── utils/

## NAMING CONVENTIONS
- Components: PascalCase
- Composables: camelCase with "use"
- Server routes: kebab-case
- Pages: kebab-case

## FILE EDITING PROTOCOL
1. READ the entire file BEFORE editing
2. IDENTIFY exactly what needs to change
3. Make ONLY necessary changes
4. DO NOT rewrite entire files unnecessarily
5. VERIFY imports and dependencies

## 📱 RESPONSIVENESS RULES
- Every UI component MUST have mobile variations
- If a component becomes too complex on mobile, create a separate mobile version
- Breakpoints:
  - Mobile: < 768px (HIGHEST PRIORITY)
  - Tablet: 768px - 1023px
  - Desktop: 1024px+