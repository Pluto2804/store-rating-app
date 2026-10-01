import { requireAuth } from '../middleware/auth.ts'
import { createToken } from '../utils/jwt.ts'
import { Router } from 'express'
import bcrypt from 'bcrypt'
import { pool } from '../db.ts'
import { signupSchema,loginSchema,passwordChangeSchema,  } from '../validators/auth.ts'
import { validate } from '../middleware/validate.ts'

const router = Router()
router.post('/login', validate(loginSchema), async (req, res) => {
    const { email, password } = req.body

    const result = await pool.query(
        `
        SELECT id, name, email, password_hash, address, role
        FROM users
        WHERE email = $1
        `,
        [email],
    )

    if (result.rows.length === 0) {
        return res.status(401).json({
            error: 'Invalid email or password',
        })
    }

    const user = result.rows[0]

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash,
    )

    if (!passwordMatches) {
        return res.status(401).json({
            error: 'Invalid email or password',
        })
    }

    const token = createToken({
    userId: user.id,
    role: user.role,
})

return res.json({
    message: 'Login successful',
    token,
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
    },
})
})

router.post('/signup', validate(signupSchema), async (req, res) => {
    const { name, email, address, password } = req.body

    const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email],
    )

    if (existingUser.rows.length > 0) {
        return res.status(409).json({
            error: 'Email already registered',
        })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await pool.query(
        `
        INSERT INTO users (name, email, password_hash, address, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, address, role, created_at
        `,
        [name, email, passwordHash, address, 'user'],
    )

    return res.status(201).json({
        user: result.rows[0],
    })
})
router.patch(
    '/password',
    requireAuth,
    validate(passwordChangeSchema),
    async (req, res) => {
        const { currentPassword, newPassword } = req.body

        const result = await pool.query(
            `
            SELECT password_hash
            FROM users
            WHERE id = $1
            `,
            [req.user!.userId],
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
            })
        }

        const passwordMatches = await bcrypt.compare(
            currentPassword,
            result.rows[0].password_hash,
        )

        if (!passwordMatches) {
            return res.status(400).json({
                error: 'Current password is incorrect',
            })
        }

        const passwordHash = await bcrypt.hash(newPassword, 12)

        await pool.query(
            `
            UPDATE users
            SET password_hash = $1
            WHERE id = $2
            `,
            [passwordHash, req.user!.userId],
        )

        return res.json({
            message: 'Password updated successfully',
        })
    },
)
export default router
