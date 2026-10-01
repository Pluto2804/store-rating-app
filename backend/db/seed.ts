import 'dotenv/config'
import bcrypt from 'bcrypt'
import pg from 'pg'

const { Pool } = pg

function requireEnv(name: string): string {
    const value = process.env[name]

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }

    return value
}

const pool = new Pool({
    host: requireEnv('DB_HOST'),
    port: Number(requireEnv('DB_PORT')),
    user: requireEnv('DB_USER'),
    password: process.env.DB_PASSWORD || undefined,
    database: requireEnv('DB_NAME'),
})

async function seed() {
    const password = process.env.SEED_ADMIN_PASSWORD

    if (!password) {
        throw new Error('Missing SEED_ADMIN_PASSWORD')
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await pool.query(
        `
        INSERT INTO users (name, email, password_hash, address, role)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
            'System Administrator',
            'admin@example.com',
            passwordHash,
            'Admin address',
            'admin',
        ]
    )

    console.log('Admin user created')
}

seed()
    .catch((error) => {
        console.error(error)
        process.exitCode = 1
    })
    .finally(async () => {
        await pool.end()
    })
