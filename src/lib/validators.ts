import { z } from 'zod'

export const phoneCI = z.string().regex(/^225[0-9]{10}$/, {
  message: 'Format attendu : 225 suivi de 10 chiffres (ex: 2250708112233)',
})

export const loginSchema = z.object({
  phone: phoneCI,
  password: z.string().min(8, 'Minimum 8 caractères'),
})

export const registerSchema = z.object({
  salon_name: z.string().min(2, 'Minimum 2 caractères').max(100),
  phone: phoneCI,
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})
