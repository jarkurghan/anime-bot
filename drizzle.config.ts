import { DATABASE_URL } from "@/utils/constants.ts";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: { url: DATABASE_URL },
});
