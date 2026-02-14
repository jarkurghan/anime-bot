import { db } from "../db/client.js";
import { episode, channelPost } from "../db/schema.js";
import { eq, and, inArray } from "drizzle-orm";
import { logError } from "../logger/index.js";

const sendAnime = async (ctx) => {
    try {
        const episodeID = ctx.startPayload.slice(12);
        const [ep] = await db.select().from(episode).where(eq(episode.id, Number(episodeID))).limit(1);
        const all = await db
            .select()
            .from(episode)
            .where(and(eq(episode.episode, ep.episode), eq(episode.animeId, ep.animeId)));
        const allID = all.map((e) => e.id);
        const posts = await db.select().from(channelPost).where(inArray(channelPost.episodeId, allID));
        const channel = process.env.CHANNEL_ID;

        let isExist = false;
        for (let i = 0; i < posts.length; i++) {
            await ctx.telegram.copyMessage(ctx.chat.id, channel, posts[i].postId).then(() => (isExist = true));
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

export { sendAnime };
