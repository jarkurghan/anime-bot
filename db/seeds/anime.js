/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex("channel_post").del();
    await knex("episode").del();
    await knex("anime_info").del();
    await knex("anime").del();

    // Insert data into anime table
    const animeIds = await knex("anime")
        .insert([
            { name: "Naruto" },
            { name: "One Piece" },
            { name: "Titanlar hujumi" },
            { name: "Naruto: Shippuden" },
            { name: "Boruto: Naruto next generations" },
            { name: "Boruto: Two blue vortex" },
        ])
        .returning("id");
    console.log(animeIds);

    // Insert data into anime_info table
    await knex("anime_info").insert([
        { info: "A story about ninjas.", anime_id: animeIds[0].id },
        { info: "A story about pirates.", anime_id: animeIds[1].id },
        { info: "A story about titans.", anime_id: animeIds[2].id },
    ]);

    // Insert data into episode table
    const episodeIds = await knex("episode")
        .insert([
            { qism: "1", nom: "Enter Naruto Uzumaki!", dublyaj: "English", post_id: 101, anime_id: animeIds[0].id },
            { qism: "1", nom: "I'm Luffy! The Man Who's Gonna Be King of the Pirates!", dublyaj: "Japanese", post_id: 102, anime_id: animeIds[1].id },
            { qism: "1", nom: "To You, in 2000 Years: The Fall of Shiganshina, Part 1", dublyaj: "English", post_id: 103, anime_id: animeIds[2].id },
        ])
        .returning("id");

    // Insert data into channel_post table
    await knex("channel_post").insert([
        { post_id: 101, episode_id: episodeIds[0] },
        { post_id: 102, episode_id: episodeIds[1] },
        { post_id: 103, episode_id: episodeIds[2] },
    ]);
};
