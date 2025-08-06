const knex = require("knex");
const user_db = knex({ client: "pg", connection: { connectionString: process.env.USER_DATABASE } });
module.exports = user_db;
