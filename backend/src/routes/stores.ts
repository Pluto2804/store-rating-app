import { Router } from 'express'
import { pool } from '../db.ts'
import { requireAuth } from '../middleware/auth.ts'
import { requireRole } from '../middleware/role.ts'

const router = Router()

router.get(
    '/',
    requireAuth,
    requireRole('user'),
    async (req, res) => {
        const search =
            typeof req.query.search === 'string'
                ? req.query.search.trim()
                : undefined

        const values: (string | number)[] = [Number(req.user!.userId)]
        const conditions: string[] = []

        if (search) {
            values.push(`%${search}%`)

            conditions.push(`
                (
                    s.name ILIKE $2
                    OR s.email ILIKE $2
                    OR s.address ILIKE $2
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
                COALESCE(AVG(r.rating), 0) AS "averageRating",
                my_rating.rating AS "myRating"
            FROM stores s

            LEFT JOIN ratings r
                ON r.store_id = s.id

            LEFT JOIN ratings my_rating
                ON my_rating.store_id = s.id
                AND my_rating.user_id = $1

            ${whereClause}

            GROUP BY
                s.id,
                s.name,
                s.email,
                s.address,
                my_rating.rating

            ORDER BY s.name
            `,
            values,
        )

        return res.json({
            stores: result.rows,
        })
    },
)

export default router
