/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable("user_page", function (table) {
        table.string("searching");
        table.boolean("only_anime");
        table.integer("dub").references("id").inTable("dub");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable("user_page", function (table) {
        table.dropColumn("searching");
        table.dropColumn("only_anime");
        table.dropColumn("dub");
    });
};
