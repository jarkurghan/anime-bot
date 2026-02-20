import type { ContextWithStartPayload } from "./types.ts";
import { db } from "../db/client.ts";
import { episode, channelPost } from "../db/schema.ts";
import { eq, and, inArray } from "drizzle-orm";
import { logError } from "../logger/index.ts";

const sendAnime = async (ctx: ContextWithStartPayload): Promise<boolean> => {
    try {
        const payload = ctx.startPayload;
        if (!payload || payload.length < 13) return false;
        const episodeID = payload.slice(12);
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

        let isExist = false;
        for (let i = 0; i < posts.length; i++) {
            await ctx.telegram.copyMessage(ctx.chat!.id, channel, posts[i].postId).then(() => {
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
