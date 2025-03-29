const db = require("../db");

async function insertEpisodes() {
    try {
        const anime = await db("anime").insert({ name: "Sening isming", number_of_episode: 1 }).returning("*");
        // await db("anime_info").insert(item).returning("*");
        const episode = { episode: "", name: "", dub: "Max film", anime_id: anime[0].id };
        const episodeID = await db("episode").insert(episode).returning("*");
        await db("channel_post").insert({ post_id: 408, episode_id: episodeID[0].id });

        console.log("✅ Ma'lumotlar muvaffaqiyatli qo'shildi!");
    } catch (error) {
        console.error(error);
    }
    return 0;
}

insertEpisodes();
