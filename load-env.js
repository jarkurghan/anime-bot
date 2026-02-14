import dotenv from "dotenv";

const env = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
dotenv.config({ path: env });
