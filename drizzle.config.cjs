require("dotenv").config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env" });

/** @type { import("drizzle-kit").Config } */
module.exports = {
    schema: "./db/schema.js",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE,
    },
};
