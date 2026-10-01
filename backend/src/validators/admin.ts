import { z } from 'zod'

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must be at most 16 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character',
    )

export const createUserSchema = z.object({
    name: z.string().min(20).max(60),
    email: z.string().trim().toLowerCase().email(),
    address: z.string().max(400),
    password: passwordSchema,
    role: z.enum(['user', 'owner']),
})
export const createStoreSchema = z.object({
    name: z.string().min(1).max(255),
    email: z.string().trim().toLowerCase().email(),
    address: z.string().max(400),
    ownerId: z.coerce.number().int().positive(),
})
