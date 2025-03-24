/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex("user").del();

    // Insert sample data into user table
    await knex("user").insert([
        {
            user_id: 1,
            username: "naruto_uzumaki",
            first_name: "Naruto",
            last_name: "Uzumaki",
        },
        {
            user_id: 2,
            username: "luffy_d_monkey",
            first_name: "Luffy",
            last_name: "Monkey D.",
        },
        {
            user_id: 3,
            username: "eren_yeager",
            first_name: "Eren",
            last_name: "Yeager",
        },
    ]);
};
