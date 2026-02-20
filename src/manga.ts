import type { ContextWithStartPayload } from "./types.ts";
import { logError } from "../logger/index.ts";

const sendManga = async (ctx: ContextWithStartPayload): Promise<boolean | undefined> => {
    try {
        const payload = ctx.startPayload;
        if (!payload) return undefined;
        const manga = payload.slice(6, 12);
        const channel = process.env.CHANNEL_ID;
        if (!channel) return undefined;

        if (manga === "boruto") {
            const post_id = payload.slice(13);
            switch (post_id) {
                case "986":
                    await ctx.telegram.copyMessage(ctx.chat!.id, channel, Number(post_id));
                    return true;
                case "987":
                    await ctx.telegram.copyMessage(ctx.chat!.id, channel, Number(post_id));
                    return true;
                case "988":
                    await ctx.telegram.copyMessage(ctx.chat!.id, channel, Number(post_id));
                    return true;
                case "989":
                    await ctx.telegram.copyMessage(ctx.chat!.id, channel, Number(post_id));
                    return true;
                case "990":
                    await ctx.telegram.copyMessage(ctx.chat!.id, channel, Number(post_id));
                    return true;
                case "991":
                    await ctx.telegram.copyMessage(ctx.chat!.id, channel, Number(post_id));
                    return true;
                case "992":
                    await ctx.telegram.copyMessage(ctx.chat!.id, channel, Number(post_id));
                    return true;
                case "993":
                    await ctx.telegram.copyMessage(ctx.chat!.id, channel, Number(post_id));
                    return true;
                case "994":
                    await ctx.telegram.copyMessage(ctx.chat!.id, channel, Number(post_id));
                    return true;
                case "995":
                    await ctx.telegram.copyMessage(ctx.chat!.id, channel, Number(post_id));
                    return true;
                case "996":
                    await ctx.telegram.copyMessage(ctx.chat!.id, channel, Number(post_id));
                    return true;
                case "997":
                    await ctx.telegram.copyMessage(ctx.chat!.id, channel, Number(post_id));
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
