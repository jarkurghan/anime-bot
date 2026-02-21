import type { Context } from "grammy";
import { db } from "../db/client.js";
import { episode, channelPost } from "../db/schema.js";
import { eq, and, inArray } from "drizzle-orm";
import { logError } from "../logger/index.js";

const sendAnime = async (ctx: Context, startPayload: string): Promise<boolean> => {
    try {
        if (startPayload.length < 13) return false;
        const episodeID = startPayload.slice(12);
        const [ep] = await db.select().from(episode).where(eq(episode.id, Number(episodeID))).limit(1);
        if (!ep) return false;
        const all = await db
            .select()
            .from(episode)
            .where(and(eq(episode.episode, ep.episode), eq(episode.animeId, ep.animeId)));
        const allID = all.map((e) => e.id);
        const posts = await db.select().from(channelPost).where(inArray(channelPost.episodeId, allID));
        const channel = process.env.CHANNEL_ID;
        if (!channel) return false;

        const chatId = ctx.chat?.id;
        if (chatId === undefined) return false;

        let isExist = false;
        for (let i = 0; i < posts.length; i++) {
            await ctx.api.copyMessage(chatId, channel, posts[i]!.postId).then(() => {
                isExist = true;
            });
        }

        if (isExist) return true;
        await ctx.reply("❌ Topilmadi!");
        return false;
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("send_anime", error);
        return false;
    }
};

export { sendAnime };
