import type { Context, Middleware } from "grammy";
import { actions } from "./actions.js";
import { checkSubscription } from "./check-subscription.js";
import { rowsToInlineKeyboard, urlBtn } from "./keyboards.js";

const requiredChannels = [{ username: process.env.MY_CHANNEL_USERNAME, name: process.env.MY_CHANNEL_NAME }];
const ADMIN_ID = process.env.ADMIN_ID;

export const handleMessage: Middleware<Context> = async (ctx, next) => {
    if (ctx.from?.id.toString() === ADMIN_ID) {
        const isSending = actions.sendToAll.flag;
        const elapsed = Number(new Date()) - Number(actions.sendToAll.time);
        if (isSending && elapsed < 60000) {
            actions.sendToAll.flag = false;
        } else if (isSending) {
            actions.sendToAll.flag = false;
            await ctx.reply("❌ Oyna yopilgan!");
            return;
        }
    }

    const notSubscribed = await checkSubscription(ctx);

    if (notSubscribed.length > 0) {
        const rows = notSubscribed.map((channel) => [urlBtn(channel.name ?? "", `https://t.me/${channel.username?.slice(1) ?? ""}`)]);
        await ctx.reply(
            "❌ Botdan foydalanish uchun quyidagi kanal" + (requiredChannels.length > 1 ? "lar" : "") + "ga a'zo bo'ling:",
            { reply_markup: rowsToInlineKeyboard(rows) }
        );
        return;
    }

    await next();
};
