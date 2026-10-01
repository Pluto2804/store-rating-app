import cors from 'cors'
import ownerRouter from './routes/owner.ts'
import ratingsRouter from './routes/ratings.ts'
import storesRouter from './routes/stores.ts'
import adminRouter from './routes/admin.ts'
import { requireRole } from './middleware/role.ts'
import { requireAuth } from './middleware/auth.ts'
import express from 'express'
import { config } from './config/env.ts'
import { pool } from './db.ts'
import { errorHandler } from './middleware/errorHandler.ts'
import authRouter from './routes/auth.ts'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/auth', authRouter)
app.use('/admin', adminRouter)
app.use('/stores', storesRouter)
app.use('/', ratingsRouter)
app.use('/owner', ownerRouter)

app.get(
    '/admin/test',
    requireAuth,
    requireRole('admin'),
    (_req, res) => {
        res.json({
            message: 'You are an admin',
        })
    },
)
app.get('/me', requireAuth, (req, res) => {
    return res.json({
        user: req.user,
    })
})

app.get('/health', async (_req, res) => {
    const result = await pool.query('SELECT NOW()')

    res.json({
        status: 'ok',
        databaseTime: result.rows[0].now,
    })
})

app.use(errorHandler)


app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
})
