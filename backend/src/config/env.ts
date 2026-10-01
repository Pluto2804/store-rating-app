import 'dotenv/config'

function requireEnv(name: string): string {
    const value = process.env[name]

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }

    return value
}

export const config = {
    port: Number(requireEnv('PORT')),

    db: {
        host: requireEnv('DB_HOST'),
        port: Number(requireEnv('DB_PORT')),
        user: requireEnv('DB_USER'),
        password: process.env.DB_PASSWORD || undefined,
        name: requireEnv('DB_NAME'),
    },

    jwt: {
        secret: requireEnv('JWT_SECRET'),
        expiresIn: requireEnv('JWT_EXPIRES_IN'),
    },
}
