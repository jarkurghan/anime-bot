const { Telegraf, Markup } = require("telegraf");
const db = require("../db/db");
const { checkSubscription } = require("./check-subscription");
const { renderAnimePage } = require("./anime-page");

const bot = new Telegraf(process.env.BOT_TOKEN);

const requiredChannels = [{ username: process.env.MY_CHANNEL_USERNAME, name: process.env.MY_CHANNEL_NAME }];

async function start(ctx) {
    //------------------------------- insert db ---------------------------------
    const { id: user_id, username, first_name, last_name } = ctx.from;
    const user = { user_id, username, first_name, last_name };

    const existingUser = await db("user").where({ user_id }).first();
    try {
        if (!existingUser) {
            const dbUser = await db("user").insert(user).returning("*");
            await db("user_page").insert({ user_id: dbUser[0].id });
            const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
            await bot.telegram.sendMessage(
                ADMIN_CHAT_ID,
                `🆕 Yangi foydalanuvchi:\n\n` +
                    `👤 Ism: ${first_name || "Noma'lum"} ${last_name || ""}\n` +
                    `🔗 Username: ${username ? `@${username}` : "Noma'lum"}\n` +
                    `🆔 ID: ${user_id}`
            );
        }
    } catch (err) {
        console.error("❌ Foydalanuvchini saqlashda xatolik:", err);
    }

    //------------------------------- check subscription ---------------------------------
    const notSubscribed = await checkSubscription(ctx);

    if (notSubscribed.length > 0) {
        return ctx.reply(
            "❌ Botdan foydalanish uchun quyidagi kanal" + (requiredChannels.length > 1 ? "lar" : "") + "ga a'zo bo‘ling:",
            Markup.inlineKeyboard(notSubscribed.map((channel) => [{ text: channel.name, url: `https://t.me/${channel.username.slice(1)}` }]))
        );
    }

    //------------------------------- response ---------------------------------
    await ctx.reply("Botga xush kelibsiz! 🎉\n\n", Markup.removeKeyboard());
    // Markup.keyboard([["🔍 Qidirish"], ["📄 Mavsum haqida"], ["📂 Boshqa mavsum"]].slice(existingUser ? 0 : 1, 3))
    // .resize()
    // .oneTime()

    const page = existingUser ? await db("user_page").where({ user_id: existingUser.id }).first().page : 0;
    const { textList, buttons } = await renderAnimePage(page);
    await ctx.reply(textList, { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) });
}

module.exports = { start };
