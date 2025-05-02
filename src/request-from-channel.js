const knex = require("../db/db");
const { logError } = require("../logger");

const sendAnime = async (ctx) => {
    try {
        const episodeID = ctx.startPayload.slice(12);
        const episode = await knex("episode").where({ id: episodeID }).first();
        const all = await knex("episode").where({ episode: episode.episode }).where({ anime_id: episode.anime_id });
        const allID = all.map((episode) => episode.id);
        const posts = await knex("channel_post").whereIn("episode_id", allID);
        const channel = process.env.CHANNEL_ID;

        let isExist = false;
        for (let i = 0; i < posts.length; i++) {
            await ctx.telegram.copyMessage(ctx.chat.id, channel, posts[i].post_id).then(() => (isExist = true));
        }

        if (isExist) return true;
        else {
            await ctx.reply("❌ Topilmadi!");
            return false;
        }
    } catch (error) {
        console.error(error.message);
        logError("send_anime", error);
        return false;
    }
};

module.exports = { sendAnime };
