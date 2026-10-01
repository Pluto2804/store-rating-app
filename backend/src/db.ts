import pg from 'pg'
import { config } from './config/env.ts'

const { Pool } = pg

export const pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
})
