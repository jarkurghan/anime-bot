/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("user", function (table) {
        table.increments("id").primary();
        table.bigInteger("user_id").notNullable().unique();
        table.string("username");
        table.string("first_name");
        table.string("last_name");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.integer("anime_id").references("id").inTable("anime");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("user");
};
