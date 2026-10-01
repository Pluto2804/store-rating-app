import { Router } from 'express'
import { pool } from '../db.ts'
import { requireAuth } from '../middleware/auth.ts'
import { requireRole } from '../middleware/role.ts'

const router = Router()

router.get(
    '/store',
    requireAuth,
    requireRole('owner'),
    async (req, res) => {
        const ownerId = req.user!.userId

        const result = await pool.query(
            `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                COALESCE(AVG(r.rating), 0) AS "averageRating",
                COUNT(r.id) AS "ratingCount"
            FROM stores s
            LEFT JOIN ratings r
                ON r.store_id = s.id
            WHERE s.owner_id = $1
            GROUP BY
                s.id,
                s.name,
                s.email,
                s.address
            `,
            [ownerId],
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Store not found',
            })
        }

        const store = result.rows[0]

        const raters = await pool.query(
            `
            SELECT
                u.id,
                u.name,
                u.email,
                r.rating,
                r.updated_at
            FROM ratings r
            JOIN users u
                ON u.id = r.user_id
            WHERE r.store_id = $1
            ORDER BY r.updated_at DESC
            `,
            [store.id],
        )

        return res.json({
            store,
            raters: raters.rows,
        })
    },
)

export default router
