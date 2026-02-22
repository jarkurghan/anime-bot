import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { animeBot } from "@/db/schema.ts";

dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env" });
dotenv.config({ path: process.env.NODE_ENV === "production" ? "../.env.production" : "../.env" });

const { Pool } = pg;

const userPool = new Pool({
    connectionString: process.env.USER_DATABASE,
});

const userDb = drizzle(userPool, { schema: { animeBot } });

export { userDb, userPool };
