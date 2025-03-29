const { Markup } = require("telegraf");
const { renderEpisodePage } = require("./render-page");
const { renderAnimePage } = require("./render-page");
const db = require("../db/db");

const changePage = async (ctx) => {
    try {
        const page = parseInt(ctx.match[1]);
        const user = await db("user").where("user_id", ctx.from.id).first();
        await db("user_page").where("user_id", user.id).update({ anime_page: page });

        const { textList, buttons } = await renderAnimePage(page);
        const keyboard = Markup.inlineKeyboard(buttons);
        await ctx.editMessageText(textList, { parse_mode: "HTML", ...keyboard });
    } catch (err) {
        console.error(err);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
};

const selectAnime = async (ctx) => {
    try {
        const animeID = parseInt(ctx.match[1]);
        const user = await db("user").where("user_id", ctx.from.id).first();
        await db("user_page").where("user_id", user.id).update({ anime_id: animeID, episode_page: 0 });

        const anime = await db("anime").where("id", animeID).first();
        if (anime.number_of_episode === 1) {
            const channel = process.env.CHANNEL_ID;
            const post = await db("episode").where("anime_id", animeID).first();

            const allDub = await db("episode").where({ anime_id: post.anime_id, episode: post.episode });
            if (allDub.length === 1) {
                const posts = await db("channel_post").where({ episode_id: allDub[0].id });
                for (let i = 0; i < posts.length; i++) await ctx.telegram.copyMessage(ctx.chat.id, channel, posts[i].post_id);

                const buttons = [[Markup.button.callback("📂 Animelar ro'yxati", "anime_list")]];
                await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) });
            } else {
                const buttons = allDub.map((dub) => [Markup.button.callback(`🎙 ${dub.dub}`, `watch_${dub.id}`)]);
                const buttonOptions = { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) };
                const text = `🎥 <b>${episode.episode}. ${episode.name}</b>\n\nUshbu qism bir nechta dublyaj studiyasi tomonidan dublyaj qilingan:`;
                await ctx.reply(text, buttonOptions);
            }
        } else {
            const { textList, buttons } = await renderEpisodePage(animeID, 0);
            const keyboard = Markup.inlineKeyboard(buttons);
            await ctx.reply(textList, { parse_mode: "HTML", ...keyboard });
        }

        ctx.deleteMessage();
    } catch (err) {
        console.error(err);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
};

const episodePage = async (ctx) => {
    try {
        const anime = parseInt(ctx.match[1]);
        const page = parseInt(ctx.match[2]);
        const user = await db("user").where("user_id", ctx.from.id).first();
        await db("user_page").where("user_id", user.id).update({ episode_page: page });

        const { textList, buttons } = await renderEpisodePage(anime, page);
        const keyboard = Markup.inlineKeyboard(buttons);
        await ctx.editMessageText(textList, { parse_mode: "HTML", ...keyboard });
    } catch (err) {
        console.error(err);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
};

const selectEpisode = async (ctx) => {
    try {
        const id = Number(ctx.match[1]);
        const channel = process.env.CHANNEL_ID;

        const userId = ctx.from.id;
        const user = await db("user").where({ user_id: userId }).first();
        if (!user) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");

        const episode = await db("episode").where({ id }).first();
        if (!episode) return ctx.reply("❌ Topilmadi!");

        const allDub = await db("episode").where({ anime_id: episode.anime_id, episode: episode.episode });
        if (allDub.length === 1) {
            const posts = await db("channel_post").where({ episode_id: allDub[0].id });
            for (let i = 0; i < posts.length; i++) await ctx.telegram.copyMessage(ctx.chat.id, channel, posts[i].post_id);

            const buttons = [[Markup.button.callback("📄 Qismlar ro'yxati", "episode_list")], [Markup.button.callback("📂 Animelar ro'yxati", "anime_list")]];
            await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) });
            await ctx.deleteMessage();
        } else {
            const buttons = allDub.map((dub) => [Markup.button.callback(`🎙 ${dub.dub}`, `watch_${dub.id}`)]);
            const buttonOptions = { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) };
            const text = `🎥 <b>${episode.episode}. ${episode.name}</b>\n\nUshbu qism bir nechta dublyaj studiyasi tomonidan dublyaj qilingan:`;
            await ctx.reply(text, buttonOptions);
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.error(err);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
};

const backToAnime = async (ctx) => {
    try {
        const user = await db("user").where("user_id", ctx.from.id).first();
        const page = await db("user_page").where("user_id", user.id);

        const { textList, buttons } = await renderAnimePage(page.anime_page);
        const keyboard = Markup.inlineKeyboard(buttons);
        await ctx.reply(textList, { parse_mode: "HTML", ...keyboard });

        ctx.deleteMessage();
    } catch (err) {
        console.error(err);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
};

const animeList = async (ctx) => {
    try {
        const user = await db("user").where("user_id", ctx.from.id).first();
        const page = await db("user_page").where("user_id", user.id).first();
        const { textList, buttons } = await renderAnimePage(page.anime_page);
        const keyboard = Markup.inlineKeyboard(buttons);
        await ctx.reply(textList, { parse_mode: "HTML", ...keyboard });
        await ctx.deleteMessage();
    } catch (err) {
        console.error(err);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
};

const episodeList = async (ctx) => {
    try {
        const user = await db("user").where("user_id", ctx.from.id).first();
        const page = await db("user_page").where("user_id", user.id).first();
        const { textList, buttons } = await renderEpisodePage(page.anime_id, page.episode_page);
        const keyboard = Markup.inlineKeyboard(buttons);
        await ctx.reply(textList, { parse_mode: "HTML", ...keyboard });
        await ctx.deleteMessage();
    } catch (err) {
        console.error(err);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
};

async function watch(ctx) {
    try {
        const id = Number(ctx.match[1]);
        const channel = process.env.CHANNEL_ID;

        await ctx.deleteMessage();

        const userId = ctx.from.id;
        const user = await db("user").where({ user_id: userId }).first();
        if (!user) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");

        const episode = await db("episode").where({ id }).first();
        if (episode) {
            const posts = await db("channel_post").where({ episode_id: episode.id });
            for (let i = 0; i < posts.length; i++) await ctx.telegram.copyMessage(ctx.chat.id, channel, posts[i].post_id);
        } else ctx.reply("❌ Topilmadi!");

        const buttons = [[Markup.button.callback("📄 Qismlar ro'yxati", "episode_list")], [Markup.button.callback("📂 Animelar ro'yxati", "anime_list")]];
        await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) });
    } catch (err) {
        console.error(err);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
}

module.exports = { renderAnimePage, changePage, selectAnime, selectEpisode, episodePage, backToAnime, animeList, episodeList, watch };
