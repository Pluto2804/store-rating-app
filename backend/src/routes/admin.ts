import { Router } from 'express'
import bcrypt from 'bcrypt'
import { pool } from '../db.ts'
import { validate } from '../middleware/validate.ts'
import { requireAuth } from '../middleware/auth.ts'
import { requireRole } from '../middleware/role.ts'
import { createUserSchema,createStoreSchema, } from '../validators/admin.ts'

const router = Router()

router.post(
    '/users',
    requireAuth,
    requireRole('admin'),
    validate(createUserSchema),
    async (req, res) => {
        const { name, email, address, password, role } = req.body

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
            INSERT INTO users (
                name,
                email,
                password_hash,
                address,
                role
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, address, role, created_at
            `,
            [name, email, passwordHash, address, role],
        )

        return res.status(201).json({
            user: result.rows[0],
        })
    },
)
router.post(
    '/stores',
    requireAuth,
    requireRole('admin'),
    validate(createStoreSchema),
    async (req, res) => {
        const { name, email, address, ownerId } = req.body

        const ownerResult = await pool.query(
            'SELECT id, role FROM users WHERE id = $1',
            [ownerId],
        )

        if (ownerResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Owner not found',
            })
        }

        if (ownerResult.rows[0].role !== 'owner') {
            return res.status(400).json({
                error: 'User must have owner role',
            })
        }

        const existingStore = await pool.query(
            'SELECT id FROM stores WHERE owner_id = $1',
            [ownerId],
        )

        if (existingStore.rows.length > 0) {
            return res.status(409).json({
                error: 'Owner already has a store',
            })
        }

        const result = await pool.query(
            `
            INSERT INTO stores (
                name,
                email,
                address,
                owner_id
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, address, owner_id, created_at
            `,
            [name, email, address, ownerId],
        )

        return res.status(201).json({
            store: result.rows[0],
        })
    },
)
router.get(
    '/users',
    requireAuth,
    requireRole('admin'),
    async (req, res) => {
        const role = typeof req.query.role === 'string'
            ? req.query.role
            : undefined

        const sort = typeof req.query.sort === 'string'
            ? req.query.sort
            : 'name'

        const allowedRoles = ['admin', 'user', 'owner']
        const allowedSorts = ['name', 'email', 'role', 'created_at']

        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({
                error: 'Invalid role filter',
            })
        }

        if (!allowedSorts.includes(sort)) {
            return res.status(400).json({
                error: 'Invalid sort field',
            })
        }

        const values: string[] = []
        const conditions: string[] = []

        if (role) {
            values.push(role)
            conditions.push(`role = $${values.length}`)
        }

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(' AND ')}`
                : ''

        const result = await pool.query(
            `
            SELECT id, name, email, address, role, created_at
            FROM users
            ${whereClause}
            ORDER BY ${sort}
            `,
            values,
        )

        return res.json({
            users: result.rows,
        })
    },
)
router.get(
    '/users/:id',
    requireAuth,
    requireRole('admin'),
    async (req, res) => {
        const userId = Number(req.params.id)

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                error: 'Invalid user id',
            })
        }

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                address,
                role,
                created_at
            FROM users
            WHERE id = $1
            `,
            [userId],
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
            })
        }

        return res.json({
            user: result.rows[0],
        })
    },
)
router.get(
    '/stats',
    requireAuth,
    requireRole('admin'),
    async (_req, res) => {
        const result = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM users) AS users,
                (SELECT COUNT(*) FROM stores) AS stores,
                (SELECT COUNT(*) FROM ratings) AS ratings
        `)

        return res.json({
            users: Number(result.rows[0].users),
            stores: Number(result.rows[0].stores),
            ratings: Number(result.rows[0].ratings),
        })
    },
)
router.get(
    '/stores',
    requireAuth,
    requireRole('admin'),
    async (req, res) => {
        const search =
            typeof req.query.search === 'string'
                ? req.query.search.trim()
                : undefined

        const sort =
            typeof req.query.sort === 'string'
                ? req.query.sort
                : 'name'

        const allowedSorts = [
            'name',
            'email',
            'address',
            'created_at',
        ]

        if (!allowedSorts.includes(sort)) {
            return res.status(400).json({
                error: 'Invalid sort field',
            })
        }

        const values: string[] = []
        const conditions: string[] = []

        if (search) {
            values.push(`%${search}%`)

            conditions.push(`
                (
                    s.name ILIKE $1
                    OR s.email ILIKE $1
                    OR s.address ILIKE $1
                )
            `)
        }

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(' AND ')}`
                : ''

        const result = await pool.query(
            `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id AS "ownerId",
                COALESCE(AVG(r.rating), 0) AS "averageRating"
            FROM stores s
            LEFT JOIN ratings r
                ON r.store_id = s.id
            ${whereClause}
            GROUP BY
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id
            ORDER BY s.${sort}
            `,
            values,
        )

        return res.json({
            stores: result.rows,
        })
    },
)
export default router
