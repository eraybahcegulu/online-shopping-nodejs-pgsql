import * as pg from 'pg'
import * as dotenv from 'dotenv';

dotenv.config()

const postgresClient = new pg.Pool({
    connectionString: process.env.DB_CONNECTION_STRING
})

export default postgresClient