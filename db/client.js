require("dotenv").config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env" });
require("dotenv").config({ path: process.env.NODE_ENV === "production" ? "../.env.production" : "../.env" });

const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const schema = require("./schema");

const pool = new Pool({
    connectionString: process.env.DATABASE,
    max: 100,
});

const db = drizzle(pool, { schema });

module.exports = { db, pool, schema };
