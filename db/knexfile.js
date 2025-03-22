// Update with your config settings.

const path = require("path");
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    client: "sqlite3",
    connection: {
        filename: path.join(__dirname, "database.sqlite"),
    },
    useNullAsDefault: true,
    migrations: {
        directory: path.join(__dirname, "migrations"),
    },
    seeds: {
        directory: path.join(__dirname, "seeds"),
    },
};
