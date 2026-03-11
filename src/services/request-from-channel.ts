import type { Context } from "grammy";

import { db } from "@/db/client.ts";
import { sendErrorLog } from "@/services/log.ts";
import { episode, channelPost } from "@/db/schema.ts";
import { eq, and, inArray } from "drizzle-orm";
import { CHANNEL } from "@/utils/constants.ts";
import { counter } from "@/services/counter.ts";

const sendAnime = async (ctx: Context, startPayload: string): Promise<boolean> => {
    try {
        if (startPayload.length < 13) return false;
        const episodeID = startPayload.slice(12);

        const whereCondition = eq(episode.id, Number(episodeID));
        const [ep] = await db.select().from(episode).where(whereCondition).limit(1);
        if (!ep) return false;

        const whereCondition2 = and(eq(episode.episode, ep.episode), eq(episode.anime_id, ep.anime_id));
        const all = await db.select().from(episode).where(whereCondition2);

        const allID = all.map((e) => e.id);
        const posts = await db.select().from(channelPost).where(inArray(channelPost.episode_id, allID));

        if (!CHANNEL) return false;

        const chatId = ctx.chat?.id;
        if (chatId === undefined) return false;

        let isExist = false;
        for (let i = 0; i < posts.length; i++) {
            await ctx.api.copyMessage(chatId, CHANNEL, posts[i]!.post_id);
            isExist = true;
        }

        if (isExist) {
            const byEpisode = new Map<number, number>();
            for (const p of posts) {
                byEpisode.set(p.episode_id, (byEpisode.get(p.episode_id) ?? 0) + 1);
            }
            for (const [episodeId, count] of byEpisode) {
                await counter(ctx, episodeId, count);
            }
            return true;
        }

        await ctx.reply("❌ Topilmadi!");
        return false;
    } catch (error) {
        await sendErrorLog({ ctx, event: "send_anime", error });
        return false;
    }
};

export { sendAnime };
