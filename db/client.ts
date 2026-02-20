import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.ts";

dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env" });
dotenv.config({ path: process.env.NODE_ENV === "production" ? "../.env.production" : "../.env" });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE,
    max: 100,
});

const db = drizzle(pool, { schema });

export { db, pool, schema };
