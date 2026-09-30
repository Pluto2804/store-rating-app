import express from 'express'
import 'dotenv/config'
import { pool } from './db.ts'

const app = express()

const PORT = Number(process.env.PORT) || 3000

app.get('/health',async(req,res)=>{
	const result = await pool.query('SELECT NOW()')
	res.json({status:'ok',
	databaseTime: result.rows[0].now,
	})
})

app.listen(PORT, ()=>{
	  console.log(`Server running on port ${PORT}`)
})
