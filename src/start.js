const { Telegraf, Markup } = require("telegraf");
const db = require("../db/db");
const { checkSubscription } = require("./check-subscription");
const { renderAnimePage } = require("./render-page");
const { sendManga } = require("./manga");
const { logError } = require("../logger");
const { sendAnime } = require("./request-from-channel");

const bot = new Telegraf(process.env.BOT_TOKEN);

const requiredChannels = [{ username: process.env.MY_CHANNEL_USERNAME, name: process.env.MY_CHANNEL_NAME }];

async function createUserDB(ctx) {
    const { id: user_id, username, first_name, last_name } = ctx.from;
    const user = { user_id, username, first_name, last_name };

    const existingUser = await db("user").where({ user_id }).first();
    try {
        if (!existingUser) {
            await ctx.reply("Botga xush kelibsiz! 🎉\n\n", Markup.removeKeyboard());
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
    } catch (error) {
        console.error(error.message);
        logError("start_add_user", error);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
}

async function start(ctx) {
    //------------------------------- insert db ---------------------------------
    await createUserDB(ctx);
    const existingUser = await db("user").where({ user_id: ctx.from.id }).first();

    //------------------------------- check subscription ---------------------------------
    const notSubscribed = await checkSubscription(ctx);

    if (notSubscribed.length > 0) {
        return ctx.reply(
            "❌ Botdan foydalanish uchun quyidagi kanal" + (requiredChannels.length > 1 ? "lar" : "") + "ga a'zo bo'ling:",
            Markup.inlineKeyboard(notSubscribed.map((channel) => [{ text: channel.name, url: `https://t.me/${channel.username.slice(1)}` }]))
        );
    }

    //------------------------------- response ---------------------------------
    if (ctx.startPayload && ctx.startPayload.slice(0, 5) === "manga") {
        const manga = await sendManga(ctx);
        if (manga) return;
    }

    if (ctx.startPayload && ctx.startPayload.slice(0, 11) === "watch_anime") {
        const anime = await sendAnime(ctx);
        if (anime) return;
    }

    const userPage = existingUser ? await db("user_page").where({ user_id: existingUser.id }).first() : { anime_page: 0, searching: "" };
    const { textList, buttons } = await renderAnimePage(userPage.anime_page, userPage.searching);
    await ctx.reply(textList, { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) });
}

module.exports = { start };
