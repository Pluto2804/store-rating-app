import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

function requireEnv(name : string): string {
	const value = process.env[name]

	if(!value){
		throw new Error(`Missing required environment variable: ${name}`)
	}

	return value
}


export const pool = new Pool({
	host: requireEnv('DB_HOST'),
	port: Number(requireEnv('DB_PORT')),
	user: requireEnv('DB_USER'),
	password: process.env.DB_PASSWORD || undefined,
	database: requireEnv('DB_NAME'),
})
