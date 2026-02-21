import type { Context } from "grammy";
import { logError } from "@/logger/index.js";

const sendManga = async (ctx: Context, startPayload: string): Promise<boolean | undefined> => {
    try {
        const manga = startPayload.slice(6, 12);
        const channel = process.env.CHANNEL_ID;
        if (!channel) return undefined;

        if (manga === "boruto") {
            const post_id = startPayload.slice(13);
            const chatId = ctx.chat?.id;
            if (chatId === undefined) return undefined;
            switch (post_id) {
                case "986":
                    await ctx.api.copyMessage(chatId, channel, Number(post_id));
                    return true;
                case "987":
                    await ctx.api.copyMessage(chatId, channel, Number(post_id));
                    return true;
                case "988":
                    await ctx.api.copyMessage(chatId, channel, Number(post_id));
                    return true;
                case "989":
                    await ctx.api.copyMessage(chatId, channel, Number(post_id));
                    return true;
                case "990":
                    await ctx.api.copyMessage(chatId, channel, Number(post_id));
                    return true;
                case "991":
                    await ctx.api.copyMessage(chatId, channel, Number(post_id));
                    return true;
                case "992":
                    await ctx.api.copyMessage(chatId, channel, Number(post_id));
                    return true;
                case "993":
                    await ctx.api.copyMessage(chatId, channel, Number(post_id));
                    return true;
                case "994":
                    await ctx.api.copyMessage(chatId, channel, Number(post_id));
                    return true;
                case "995":
                    await ctx.api.copyMessage(chatId, channel, Number(post_id));
                    return true;
                case "996":
                    await ctx.api.copyMessage(chatId, channel, Number(post_id));
                    return true;
                case "997":
                    await ctx.api.copyMessage(chatId, channel, Number(post_id));
                    return true;
                default:
                    return false;
            }
        }
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("send_manga", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

export { sendManga };
