import { IS_HAVE_DATABASE } from "@/utils/constants.ts";
import { DATABASE_URL } from "@/utils/constants.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema.ts";
import pg from "pg";

if (!IS_HAVE_DATABASE) throw new Error("DATABASE_URL topilmadi!");

const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL, max: 100 });

const db = drizzle(pool, { schema });
export { db, pool, schema };
