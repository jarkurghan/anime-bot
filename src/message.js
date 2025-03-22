const { actions } = require("..");
const { checkSubscription } = require("./check-subscription");
const { Markup } = require("telegraf");

const requiredChannels = [{ username: process.env.MY_CHANNEL_USERNAME, name: process.env.MY_CHANNEL_NAME }];
const ADMIN_ID = process.env.ADMIN_ID;

async function handleMessage(ctx, next) {
    if (ctx.from.id.toString() === ADMIN_ID) {
        const isSending = actions.sendToAll.flag;
        if (isSending && new Date() - actions.sendToAll.time < 60000) {
            //  to-do: send message to all users
            actions.sendToAll.flag = false;
        } else if (isSending) {
            actions.sendToAll.flag = false;
            return ctx.reply("❌ Oyna yopilgan!");
        }

        // return next(); // Agar admin bo‘lsa, tekshirishni o‘tkazib yuborish
    }

    const notSubscribed = await checkSubscription(ctx);

    if (notSubscribed.length > 0) {
        return ctx.reply(
            "❌ Botdan foydalanish uchun quyidagi kanal" + (requiredChannels.length > 1 ? "lar" : "") + "ga a'zo bo‘ling:",
            Markup.inlineKeyboard(notSubscribed.map((channel) => [{ text: channel.name, url: `https://t.me/${channel.username.slice(1)}` }]))
        );
    }

    next();
}

module.exports = { handleMessage };
