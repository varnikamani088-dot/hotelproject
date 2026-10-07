const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "pearl_horizon",
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432
})

pool.on("connect", () => {
  console.log("PostgreSQL client connected to the pool")
})

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err.message)
})

module.exports = pool