import dotenv from "dotenv";
dotenv.config();

import pg from "pg";

const db = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

export default db;
