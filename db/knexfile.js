// Update with your config settings.
require("dotenv").config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env" });
require("dotenv").config({ path: process.env.NODE_ENV === "production" ? "../.env.production" : "../.env" });

const path = require("path");
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    client: "sqlite3",
    connection: {
        filename: path.join(__dirname, process.env.DATABASE),
    },
    useNullAsDefault: true,
    migrations: {
        directory: path.join(__dirname, "migrations"),
    },
    seeds: {
        directory: path.join(__dirname, "seeds"),
    },
};
