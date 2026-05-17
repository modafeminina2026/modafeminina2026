/**
 * One-time setup route to create the first super_admin.
 * Disabled automatically after first admin exists.
 * DELETE this file after setup is complete.
 */
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = createClient(process.env.SUPABASE_URL!, config.supabaseServiceRoleKey as string)

  // Block if any admin already exists
  const { count } = await db
    .from('admin_users')
    .select('id', { count: 'exact', head: true })

  if ((count ?? 0) > 0) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Setup já foi realizado. Delete este arquivo.',
    })
  }

  const body = await readBody(event)
  const { email, password, setup_key } = body as {
    email: string
    password: string
    setup_key: string
  }

  // Require a setup key from env for security
  const expectedKey = (config.adminSetupKey as string) ?? 'lovers-setup-2025'
  if (setup_key !== expectedKey) {
    throw createError({ statusCode: 401, statusMessage: 'Setup key inválida' })
  }

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'email e password obrigatórios' })
  }

  // Create auth user
  const { data: authData, error: authError } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    throw createError({ statusCode: 500, statusMessage: authError?.message ?? 'Erro ao criar usuário' })
  }

  // Create admin record
  const { data: admin, error: adminError } = await db
    .from('admin_users')
    .insert({
      user_id: authData.user.id,
      role: 'super_admin',
      permissions: ['*'],
      is_active: true,
    })
    .select('id, role')
    .single()

  if (adminError) {
    // Rollback: delete auth user
    await db.auth.admin.deleteUser(authData.user.id)
    throw createError({ statusCode: 500, statusMessage: adminError.message })
  }

  return {
    message: '✅ Super admin criado com sucesso! Delete o arquivo setup.post.ts agora.',
    admin_id: admin.id,
    email,
    role: admin.role,
  }
})
