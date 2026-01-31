const { Markup } = require("telegraf");
const { renderEpisodePage } = require("./render-page");
const { renderAnimePage } = require("./render-page");
const { logError } = require("../logger");
const { db } = require("../db/client");
const { user, userPage, anime, episode, channelPost } = require("../db/schema");
const { eq, and, gte, lte } = require("drizzle-orm");

const search = async (ctx) => {
    try {
        if (ctx.message.chat.type === "private") {
            const message = ctx.message.text;
            const [u] = await db.select().from(user).where(eq(user.userId, ctx.from.id)).limit(1);
            if (!u) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
            await db
                .update(userPage)
                .set({ animePage: 0, episodePage: 0, searching: message })
                .where(eq(userPage.userId, u.id));
            const { textList, buttons } = await renderAnimePage(0, message);
            const keyboard = Markup.inlineKeyboard(buttons);
            await ctx.reply(textList, { parse_mode: "HTML", ...keyboard });
        }
    } catch (error) {
        console.error(error.message);
        logError("search", error);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const reserFilter = async (ctx) => {
    try {
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from.id)).limit(1);
        if (!u) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
        await db.update(userPage).set({ animePage: 0, episodePage: 0, searching: "" }).where(eq(userPage.userId, u.id));
        const { textList, buttons } = await renderAnimePage(0, "");
        await ctx.editMessageText(textList, { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) });
    } catch (error) {
        console.error(error.message);
        logError("change_page", error);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
};

const changePage = async (ctx) => {
    try {
        const page = parseInt(ctx.match[1]);
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from.id)).limit(1);
        if (!u) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
        const [updated] = await db.update(userPage).set({ animePage: page }).where(eq(userPage.userId, u.id)).returning();

        const { textList, buttons } = await renderAnimePage(page, updated.searching);
        const keyboard = Markup.inlineKeyboard(buttons);
        await ctx.editMessageText(textList, { parse_mode: "HTML", ...keyboard });
    } catch (error) {
        console.error(error.message);
        logError("change_page", error);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const selectAnime = async (ctx) => {
    try {
        const animeID = parseInt(ctx.match[1]);
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from.id)).limit(1);
        if (!u) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
        await db.update(userPage).set({ animeId: animeID, episodePage: 0 }).where(eq(userPage.userId, u.id));

        const [animeRow] = await db.select().from(anime).where(eq(anime.id, animeID)).limit(1);
        if (animeRow.numberOfEpisode === 1) {
            const channel = process.env.CHANNEL_ID;
            const [post] = await db.select().from(episode).where(eq(episode.animeId, animeID)).limit(1);

            const allDub = await db
                .select()
                .from(episode)
                .where(and(eq(episode.animeId, post.animeId), eq(episode.episode, post.episode)));
            if (allDub.length === 1) {
                const posts = await db.select().from(channelPost).where(eq(channelPost.episodeId, allDub[0].id));
                for (let i = 0; i < posts.length; i++) await ctx.telegram.copyMessage(ctx.chat.id, channel, posts[i].postId);

                const buttons = [[Markup.button.callback("📂 Animelar ro'yxati", "anime_list")]];
                await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) });
            } else {
                const buttons = allDub.map((d) => [Markup.button.callback(`🎙 ${d.dub}`, `watch_${d.id}`)]);
                const buttonOptions = { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) };
                const text = `🎥 <b>${post.episode}. ${post.name}</b>\n\nUshbu qism bir nechta dublyaj studiyasi tomonidan dublyaj qilingan:`;
                await ctx.reply(text, buttonOptions);
            }
        } else {
            const { textList, buttons } = await renderEpisodePage(animeID, 0);
            const keyboard = Markup.inlineKeyboard(buttons);
            await ctx.reply(textList, { parse_mode: "HTML", ...keyboard });
        }

        ctx.deleteMessage();
    } catch (error) {
        console.error(error.message);
        logError("select_anime", error);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const episodePage = async (ctx) => {
    try {
        const animeId = parseInt(ctx.match[1]);
        const page = parseInt(ctx.match[2]);
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from.id)).limit(1);
        if (!u) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
        await db.update(userPage).set({ episodePage: page }).where(eq(userPage.userId, u.id));

        const { textList, buttons } = await renderEpisodePage(animeId, page);
        const keyboard = Markup.inlineKeyboard(buttons);
        await ctx.editMessageText(textList, { parse_mode: "HTML", ...keyboard });
    } catch (error) {
        console.error(error.message);
        logError("episode_page", error);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const selectEpisode = async (ctx) => {
    try {
        const id = Number(ctx.match[1]);
        const channel = process.env.CHANNEL_ID;

        const userId = ctx.from.id;
        const [u] = await db.select().from(user).where(eq(user.userId, userId)).limit(1);
        if (!u) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");

        const [ep] = await db.select().from(episode).where(eq(episode.id, id)).limit(1);
        if (!ep) return ctx.reply("❌ Topilmadi!");

        const allDub = await db
            .select()
            .from(episode)
            .where(and(eq(episode.animeId, ep.animeId), eq(episode.episode, ep.episode)));
        if (allDub.length === 1) {
            const posts = await db.select().from(channelPost).where(eq(channelPost.episodeId, allDub[0].id));
            for (let i = 0; i < posts.length; i++)
                await ctx.telegram.copyMessage(ctx.chat.id, channel, posts[i].postId).catch((error) => {
                    console.error(error.message);
                    logError("select_episode_" + ep.id, error);
                    ctx.reply("❌ Topilmadi!");
                });

            const buttons = [[Markup.button.callback("📄 Qismlar ro'yxati", "episode_list")], [Markup.button.callback("📂 Animelar ro'yxati", "anime_list")]];
            await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) });
            await ctx.deleteMessage();
        } else {
            const buttons = allDub.map((d) => [Markup.button.callback(`🎙 ${d.dub}`, `watch_${d.id}`)]);
            const buttonOptions = { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) };
            const text = `🎥 <b>${ep.episode}. ${ep.name}</b>\n\nUshbu qism bir nechta dublyaj studiyasi tomonidan dublyaj qilingan:`;
            await ctx.reply(text, buttonOptions);
            await ctx.deleteMessage();
        }
    } catch (error) {
        console.error(error.message);
        logError("select_episode", error);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const selectAllEpisode = async (ctx) => {
    try {
        const id1 = Number(ctx.match[1]);
        const id2 = Number(ctx.match[2]);
        const channel = process.env.CHANNEL_ID;

        const userId = ctx.from.id;
        const [u] = await db.select().from(user).where(eq(user.userId, userId)).limit(1);
        if (!u) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");

        const episodes = await db
            .select()
            .from(episode)
            .where(and(gte(episode.id, id1), lte(episode.id, id2)));
        if (episodes.length === 0) return ctx.reply("❌ Topilmadi!");

        for (let i = 0; i < episodes.length; i++) {
            const ep = episodes[i];
            const allDub = await db
                .select()
                .from(episode)
                .where(and(eq(episode.animeId, ep.animeId), eq(episode.episode, ep.episode)));
            for (let j = 0; j < allDub.length; j++) {
                const posts = await db.select().from(channelPost).where(eq(channelPost.episodeId, allDub[j].id));
                for (let k = 0; k < posts.length; k++) {
                    await ctx.telegram.copyMessage(ctx.chat.id, channel, posts[k].postId).catch((error) => {
                        console.error(error.message);
                        logError("select_all_episode_" + allDub[j].id, error);
                    });
                }
            }
        }

        const buttons = [[Markup.button.callback("📄 Qismlar ro'yxati", "episode_list")], [Markup.button.callback("📂 Animelar ro'yxati", "anime_list")]];
        await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) });
        await ctx.deleteMessage();
    } catch (error) {
        console.error(error.message);
        logError("select_all_episode", error);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const backToAnime = async (ctx) => {
    try {
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from.id)).limit(1);
        if (!u) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
        const [page] = await db.select().from(userPage).where(eq(userPage.userId, u.id)).limit(1);

        const { textList, buttons } = await renderAnimePage(page.animePage, page.searching);
        await ctx.reply(textList, { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) });

        ctx.deleteMessage();
    } catch (error) {
        console.error(error.message);
        logError("back_to_anime", error);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const animeList = async (ctx) => {
    try {
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from.id)).limit(1);
        if (!u) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
        const [page] = await db.select().from(userPage).where(eq(userPage.userId, u.id)).limit(1);
        const { textList, buttons } = await renderAnimePage(page.animePage, page.searching);
        const keyboard = Markup.inlineKeyboard(buttons);
        await ctx.reply(textList, { parse_mode: "HTML", ...keyboard });
        await ctx.deleteMessage();
    } catch (error) {
        console.error(error.message);
        logError("anime_list", error);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const episodeList = async (ctx) => {
    try {
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from.id)).limit(1);
        if (!u) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
        const [page] = await db.select().from(userPage).where(eq(userPage.userId, u.id)).limit(1);
        const { textList, buttons } = await renderEpisodePage(page.animeId, page.episodePage);
        const keyboard = Markup.inlineKeyboard(buttons);
        await ctx.reply(textList, { parse_mode: "HTML", ...keyboard });
        await ctx.deleteMessage();
    } catch (error) {
        console.error(error.message);
        logError("episode_list", error);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

async function watch(ctx) {
    try {
        const id = Number(ctx.match[1]);
        const channel = process.env.CHANNEL_ID;

        await ctx.deleteMessage();

        const userId = ctx.from.id;
        const [u] = await db.select().from(user).where(eq(user.userId, userId)).limit(1);
        if (!u) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");

        const [ep] = await db.select().from(episode).where(eq(episode.id, id)).limit(1);
        if (ep) {
            const posts = await db.select().from(channelPost).where(eq(channelPost.episodeId, ep.id));
            for (let i = 0; i < posts.length; i++) await ctx.telegram.copyMessage(ctx.chat.id, channel, posts[i].postId);
        } else ctx.reply("❌ Topilmadi!");

        const buttons = [[Markup.button.callback("📄 Qismlar ro'yxati", "episode_list")], [Markup.button.callback("📂 Animelar ro'yxati", "anime_list")]];
        await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) });
    } catch (error) {
        console.error(error.message);
        logError("watch", error);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
}

module.exports = { changePage, selectAnime, selectEpisode, selectAllEpisode, episodePage, backToAnime, animeList, episodeList, watch, search, reserFilter };
