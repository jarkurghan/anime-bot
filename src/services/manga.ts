import type { Context } from "grammy";
import { sendErrorLog } from "@/services/log.ts";
import { CHANNEL } from "@/utils/constants.ts";
import { counter } from "./counter.ts";

const sendManga = async (ctx: Context, startPayload: string): Promise<boolean | undefined> => {
    try {
        const manga = startPayload.slice(6, 12);
        if (!CHANNEL) return undefined;

        if (manga === "boruto") {
            counter(ctx);

            const post_id = startPayload.slice(13);
            const chatId = ctx.chat?.id;
            if (chatId === undefined) return undefined;
            switch (post_id) {
                case "986":
                    await ctx.api.copyMessage(chatId, CHANNEL, Number(post_id));
                    return true;
                case "987":
                    await ctx.api.copyMessage(chatId, CHANNEL, Number(post_id));
                    return true;
                case "988":
                    await ctx.api.copyMessage(chatId, CHANNEL, Number(post_id));
                    return true;
                case "989":
                    await ctx.api.copyMessage(chatId, CHANNEL, Number(post_id));
                    return true;
                case "990":
                    await ctx.api.copyMessage(chatId, CHANNEL, Number(post_id));
                    return true;
                case "991":
                    await ctx.api.copyMessage(chatId, CHANNEL, Number(post_id));
                    return true;
                case "992":
                    await ctx.api.copyMessage(chatId, CHANNEL, Number(post_id));
                    return true;
                case "993":
                    await ctx.api.copyMessage(chatId, CHANNEL, Number(post_id));
                    return true;
                case "994":
                    await ctx.api.copyMessage(chatId, CHANNEL, Number(post_id));
                    return true;
                case "995":
                    await ctx.api.copyMessage(chatId, CHANNEL, Number(post_id));
                    return true;
                case "996":
                    await ctx.api.copyMessage(chatId, CHANNEL, Number(post_id));
                    return true;
                case "997":
                    await ctx.api.copyMessage(chatId, CHANNEL, Number(post_id));
                    return true;
                default:
                    return false;
            }
        }
    } catch (error) {
        await sendErrorLog({ ctx, event: "send_manga", error });
    }
};

export { sendManga };
