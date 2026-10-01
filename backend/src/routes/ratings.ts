import { Router } from 'express'
import { pool } from '../db.ts'
import { requireAuth } from '../middleware/auth.ts'
import { requireRole } from '../middleware/role.ts'

const router = Router()

router.post(
    '/stores/:storeId/rating',
    requireAuth,
    requireRole('user'),
    async (req, res) => {
        const storeId = Number(req.params.storeId)
        const rating = Number(req.body.rating)

        if (!Number.isInteger(storeId) || storeId <= 0) {
            return res.status(400).json({
                error: 'Invalid store id',
            })
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5',
            })
        }

        const store = await pool.query(
            'SELECT id FROM stores WHERE id = $1',
            [storeId],
        )

        if (store.rows.length === 0) {
            return res.status(404).json({
                error: 'Store not found',
            })
        }

        const result = await pool.query(
            `
            INSERT INTO ratings (user_id, store_id, rating)
            VALUES ($1, $2, $3)

            ON CONFLICT (user_id, store_id)
            DO UPDATE SET
                rating = EXCLUDED.rating,
                updated_at = NOW()

            RETURNING id, user_id, store_id, rating, updated_at
            `,
            [req.user!.userId, storeId, rating],
        )

        return res.json({
            rating: result.rows[0],
        })
    },
)

export default router
