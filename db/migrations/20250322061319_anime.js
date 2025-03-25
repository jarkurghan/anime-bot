/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable("anime", function (table) {
            table.increments("id").primary();
            table.string("name").notNullable();
            table.integer("number_of_episode").notNullable();
            table.timestamp("created_at").defaultTo(knex.fn.now());
        })
        .createTable("anime_info", function (table) {
            table.increments("id").primary();
            table.integer("post_id").notNullable().unique();
            table.integer("anime_id").references("id").inTable("anime").notNullable();
        })
        .createTable("episode", function (table) {
            table.increments("id").primary();
            table.string("episode").notNullable();
            table.string("name").notNullable();
            table.string("dub").notNullable();
            table.integer("anime_id").references("id").inTable("anime").notNullable();
        })
        .createTable("channel_post", function (table) {
            table.increments("id").primary();
            table.integer("post_id").notNullable().unique();
            table.integer("episode_id").references("id").inTable("episode").notNullable();
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("channel_post").dropTable("episode").dropTable("anime_info").dropTable("anime");
};
