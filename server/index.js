import express from 'express'
import pg from 'pg'

const { Pool } = pg
const app = express()
const port = process.env.PORT || 3001

// The local Homebrew PostgreSQL server authenticates the current macOS user.
// Override these defaults later with PGDATABASE or DATABASE_URL if needed.
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({ database: process.env.PGDATABASE || 'emr_db' })

app.get('/api/patients', async (_request, response) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, created_at
       FROM test_patients
       ORDER BY id`,
    )

    return response.json(result.rows)
  } catch (error) {
    console.error('Unable to fetch patient:', error)
    return response.status(500).json({ message: 'Unable to read the patient database.' })
  }
})

app.listen(port, () => {
  console.log(`EMR API listening at http://localhost:${port}`)
})
