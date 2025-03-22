const { Telegraf, Markup } = require("telegraf");
const db = require("../db/db");
const { checkSubscription } = require("./check-subscription");
const { renderPage } = require("./anime-page");

const bot = new Telegraf(process.env.BOT_TOKEN);

const requiredChannels = [{ username: process.env.MY_CHANNEL_USERNAME, name: process.env.MY_CHANNEL_NAME }];

async function start(ctx) {
    const user = {
        user_id: ctx.from.id,
        username: ctx.from.username || null,
        first_name: ctx.from.first_name || null,
        last_name: ctx.from.last_name || null,
    };
    await db("user").del();
    const existingUser = await db("user").where({ user_id: user.user_id }).first();
    try {
        if (!existingUser) {
            const dbUser = await db("user").insert(user);
            await db("user_page").insert({ user_id: dbUser[0].id });
            const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
            await bot.telegram.sendMessage(
                ADMIN_CHAT_ID,
                `🆕 Yangi foydalanuvchi:\n\n` +
                    `👤 Ism: ${user.first_name || "Noma'lum"} ${user.last_name || ""}\n` +
                    `🔗 Username: ${user.username ? `@${user.username}` : "Noma'lum"}\n` +
                    `🆔 ID: ${user.user_id}`
            );
        }
    } catch (err) {
        console.error("❌ Foydalanuvchini saqlashda xatolik:", err);
    }

    const notSubscribed = await checkSubscription(ctx);

    if (notSubscribed.length > 0) {
        return ctx.reply(
            "❌ Botdan foydalanish uchun quyidagi kanal" + (requiredChannels.length > 1 ? "lar" : "") + "ga a'zo bo‘ling:",
            Markup.inlineKeyboard(notSubscribed.map((channel) => [{ text: channel.name, url: `https://t.me/${channel.username.slice(1)}` }]))
        );
    }

    const { textList, buttons } = await renderPage(0);
    await ctx.reply(`Animelar ro'yxati:\n\n${textList}`, Markup.inlineKeyboard(buttons));
}

module.exports = { start };
