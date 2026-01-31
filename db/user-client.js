require("dotenv").config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env" });
require("dotenv").config({ path: process.env.NODE_ENV === "production" ? "../.env.production" : "../.env" });

const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const { animeBot } = require("./schema");

const userPool = new Pool({
    connectionString: process.env.USER_DATABASE,
});

const userDb = drizzle(userPool, { schema: { animeBot } });

module.exports = { userDb, userPool };
