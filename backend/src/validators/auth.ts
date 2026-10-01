import { z } from 'zod'

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must be at most 16 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
    )

export const signupSchema = z.object({
    name: z.string().min(20).max(60),
    email: z.string().trim().toLowerCase().email(),
    address: z.string().max(400),
    password: passwordSchema,
})

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string(),
})
export const passwordChangeSchema = z.object({
    currentPassword: z.string(),
    newPassword: passwordSchema,
})
