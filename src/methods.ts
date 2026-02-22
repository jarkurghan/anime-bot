import type { Context } from "grammy";
import { renderEpisodePage, renderAnimePage } from "@/src/render-page.ts";
import { logError } from "@/logger/index.ts";
import { db } from "@/db/client.ts";
import { user, userPage, anime, episode, channelPost } from "@/db/schema.ts";
import { eq, and, gte, lte } from "drizzle-orm";
import type { MatchedContext } from "@/src/types.ts";
import { cb, rowsToInlineKeyboard } from "@/src/keyboards.ts";

const search = async (ctx: Context): Promise<void> => {
    try {
        const msg = ctx.message;
        if (!msg || !("text" in msg) || ctx.chat?.type !== "private") return;
        const message = msg.text;
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from!.id)).limit(1);
        if (!u) {
            void ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
            return;
        }
        await db
            .update(userPage)
            .set({ animePage: 0, episodePage: 0, searching: message })
            .where(eq(userPage.userId, u.id));
        const { textList, buttons } = await renderAnimePage(0, message);
        await ctx.reply(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("search", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const reserFilter = async (ctx: MatchedContext): Promise<void> => {
    try {
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from!.id)).limit(1);
        if (!u) {
            void ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
            return;
        }
        await db.update(userPage).set({ animePage: 0, episodePage: 0, searching: "" }).where(eq(userPage.userId, u.id));
        const { textList, buttons } = await renderAnimePage(0, "");
        await ctx.editMessageText(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("change_page", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
};

const changePage = async (ctx: MatchedContext): Promise<void> => {
    try {
        const page = parseInt(ctx.match[1]!, 10);
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from!.id)).limit(1);
        if (!u) {
            void ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
            return;
        }
        const [updated] = await db.update(userPage).set({ animePage: page }).where(eq(userPage.userId, u.id)).returning();

        const { textList, buttons } = await renderAnimePage(page, updated?.searching ?? "");
        await ctx.editMessageText(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("change_page", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const selectAnime = async (ctx: MatchedContext): Promise<void> => {
    try {
        const animeID = parseInt(ctx.match[1]!, 10);
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from!.id)).limit(1);
        if (!u) {
            void ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
            return;
        }
        await db.update(userPage).set({ animeId: animeID, episodePage: 0 }).where(eq(userPage.userId, u.id));

        const [animeRow] = await db.select().from(anime).where(eq(anime.id, animeID)).limit(1);
        if (!animeRow) return;
        if (animeRow.numberOfEpisode === 1) {
            const channel = process.env.CHANNEL_ID;
            const [post] = await db.select().from(episode).where(eq(episode.animeId, animeID)).limit(1);
            if (!post || !channel) return;

            const allDub = await db
                .select()
                .from(episode)
                .where(and(eq(episode.animeId, post.animeId), eq(episode.episode, post.episode)));
            if (allDub.length === 1) {
                const posts = await db.select().from(channelPost).where(eq(channelPost.episodeId, allDub[0]!.id));
                const chatId = ctx.chat!.id;
                for (let i = 0; i < posts.length; i++) await ctx.api.copyMessage(chatId, channel, posts[i]!.postId);

                const buttons = [[cb("📂 Animelar ro'yxati", "anime_list")]];
                await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
            } else {
                const buttons = allDub.map((d) => [cb(`🎙 ${d.dub}`, `watch_${d.id}`)]);
                const text = `🎥 <b>${post.episode}. ${post.name}</b>\n\nUshbu qism bir nechta dublyaj studiyasi tomonidan dublyaj qilingan:`;
                await ctx.reply(text, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
            }
        } else {
            const { textList, buttons } = await renderEpisodePage(animeID, 0);
            await ctx.reply(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
        }

        void ctx.deleteMessage();
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("select_anime", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const episodePage = async (ctx: MatchedContext): Promise<void> => {
    try {
        const animeId = parseInt(ctx.match[1]!, 10);
        const page = parseInt(ctx.match[2]!, 10);
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from!.id)).limit(1);
        if (!u) {
            void ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
            return;
        }
        await db.update(userPage).set({ episodePage: page }).where(eq(userPage.userId, u.id));

        const { textList, buttons } = await renderEpisodePage(animeId, page);
        await ctx.editMessageText(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("episode_page", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const selectEpisode = async (ctx: MatchedContext): Promise<void> => {
    try {
        const id = Number(ctx.match[1]);
        const channel = process.env.CHANNEL_ID;

        const userId = ctx.from!.id;
        const [u] = await db.select().from(user).where(eq(user.userId, userId)).limit(1);
        if (!u) {
            void ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
            return;
        }

        const [ep] = await db.select().from(episode).where(eq(episode.id, id)).limit(1);
        if (!ep) {
            void ctx.reply("❌ Topilmadi!");
            return;
        }

        const allDub = await db
            .select()
            .from(episode)
            .where(and(eq(episode.animeId, ep.animeId), eq(episode.episode, ep.episode)));
        if (allDub.length === 1) {
            const posts = await db.select().from(channelPost).where(eq(channelPost.episodeId, allDub[0]!.id));
            const chatId = ctx.chat!.id;
            for (let i = 0; i < posts.length; i++)
                await ctx.api.copyMessage(chatId, channel!, posts[i]!.postId).catch((err: unknown) => {
                    console.error(err instanceof Error ? err.message : err);
                    logError("select_episode_" + String(ep.id), err);
                    void ctx.reply("❌ Topilmadi!");
                });

            const buttons = [
                [cb("📄 Qismlar ro'yxati", "episode_list")],
                [cb("📂 Animelar ro'yxati", "anime_list")],
            ];
            await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
            await ctx.deleteMessage();
        } else {
            const buttons = allDub.map((d) => [cb(`🎙 ${d.dub}`, `watch_${d.id}`)]);
            const text = `🎥 <b>${ep.episode}. ${ep.name}</b>\n\nUshbu qism bir nechta dublyaj studiyasi tomonidan dublyaj qilingan:`;
            await ctx.reply(text, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
            await ctx.deleteMessage();
        }
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("select_episode", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const selectAllEpisode = async (ctx: MatchedContext): Promise<void> => {
    try {
        const id1 = Number(ctx.match[1]);
        const id2 = Number(ctx.match[2]);
        const channel = process.env.CHANNEL_ID;

        const userId = ctx.from!.id;
        const [u] = await db.select().from(user).where(eq(user.userId, userId)).limit(1);
        if (!u) {
            void ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
            return;
        }

        const episodes = await db
            .select()
            .from(episode)
            .where(and(gte(episode.id, id1), lte(episode.id, id2)));
        if (episodes.length === 0) {
            void ctx.reply("❌ Topilmadi!");
            return;
        }

        const chatId = ctx.chat!.id;
        for (let i = 0; i < episodes.length; i++) {
            const ep = episodes[i]!;
            const allDub = await db
                .select()
                .from(episode)
                .where(and(eq(episode.animeId, ep.animeId), eq(episode.episode, ep.episode)));
            for (let j = 0; j < allDub.length; j++) {
                const posts = await db.select().from(channelPost).where(eq(channelPost.episodeId, allDub[j]!.id));
                for (let k = 0; k < posts.length; k++) {
                    await ctx.api.copyMessage(chatId, channel!, posts[k]!.postId).catch((err: unknown) => {
                        console.error(err instanceof Error ? err.message : err);
                        logError("select_all_episode_" + String(allDub[j]!.id), err);
                    });
                }
            }
        }

        const buttons = [
            [cb("📄 Qismlar ro'yxati", "episode_list")],
            [cb("📂 Animelar ro'yxati", "anime_list")],
        ];
        await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
        await ctx.deleteMessage();
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("select_all_episode", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const backToAnime = async (ctx: MatchedContext): Promise<void> => {
    try {
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from!.id)).limit(1);
        if (!u) {
            void ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
            return;
        }
        const [page] = await db.select().from(userPage).where(eq(userPage.userId, u.id)).limit(1);

        const { textList, buttons } = await renderAnimePage(page?.animePage ?? 0, page?.searching ?? "");
        await ctx.reply(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });

        void ctx.deleteMessage();
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("back_to_anime", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const animeList = async (ctx: MatchedContext): Promise<void> => {
    try {
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from!.id)).limit(1);
        if (!u) {
            void ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
            return;
        }
        const [page] = await db.select().from(userPage).where(eq(userPage.userId, u.id)).limit(1);
        const { textList, buttons } = await renderAnimePage(page?.animePage ?? 0, page?.searching ?? "");
        await ctx.reply(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
        await ctx.deleteMessage();
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("anime_list", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

const episodeList = async (ctx: MatchedContext): Promise<void> => {
    try {
        const [u] = await db.select().from(user).where(eq(user.userId, ctx.from!.id)).limit(1);
        if (!u) {
            void ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
            return;
        }
        const [page] = await db.select().from(userPage).where(eq(userPage.userId, u.id)).limit(1);
        const { textList, buttons } = await renderEpisodePage(page?.animeId ?? 0, page?.episodePage ?? 0);
        await ctx.reply(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
        await ctx.deleteMessage();
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("episode_list", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
};

async function watch(ctx: MatchedContext): Promise<void> {
    try {
        const id = Number(ctx.match[1]);
        const channel = process.env.CHANNEL_ID;

        await ctx.deleteMessage();

        const userId = ctx.from!.id;
        const [u] = await db.select().from(user).where(eq(user.userId, userId)).limit(1);
        if (!u) {
            void ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
            return;
        }

        const chatId = ctx.chat!.id;
        const [ep] = await db.select().from(episode).where(eq(episode.id, id)).limit(1);
        if (ep && channel) {
            const posts = await db.select().from(channelPost).where(eq(channelPost.episodeId, ep.id));
            for (let i = 0; i < posts.length; i++) await ctx.api.copyMessage(chatId, channel, posts[i]!.postId);
        } else void ctx.reply("❌ Topilmadi!");

        const buttons = [
            [cb("📄 Qismlar ro'yxati", "episode_list")],
            [cb("📂 Animelar ro'yxati", "anime_list")],
        ];
        await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("watch", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
}

export { changePage, selectAnime, selectEpisode, selectAllEpisode, episodePage, backToAnime, animeList, episodeList, watch, search, reserFilter };
