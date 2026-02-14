import type { Context, MiddlewareFn } from "telegraf";
import { Markup } from "telegraf";
import { actions } from "./actions.js";
import { checkSubscription } from "./check-subscription.js";

const requiredChannels = [{ username: process.env.MY_CHANNEL_USERNAME, name: process.env.MY_CHANNEL_NAME }];
const ADMIN_ID = process.env.ADMIN_ID;

export const handleMessage: MiddlewareFn<Context> = async (ctx, next) => {
    if (ctx.from?.id.toString() === ADMIN_ID) {
        const isSending = actions.sendToAll.flag;
        const elapsed = Number(new Date()) - Number(actions.sendToAll.time);
        if (isSending && elapsed < 60000) {
            actions.sendToAll.flag = false;
        } else if (isSending) {
            actions.sendToAll.flag = false;
            return ctx.reply("❌ Oyna yopilgan!");
        }
    }

    const notSubscribed = await checkSubscription(ctx);

    if (notSubscribed.length > 0) {
        return ctx.reply(
            "❌ Botdan foydalanish uchun quyidagi kanal" + (requiredChannels.length > 1 ? "lar" : "") + "ga a'zo bo'ling:",
            Markup.inlineKeyboard(
                notSubscribed.map((channel) => [{ text: channel.name ?? "", url: `https://t.me/${channel.username?.slice(1) ?? ""}` }])
            )
        );
    }

    return next();
};
