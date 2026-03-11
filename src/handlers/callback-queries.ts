import type { Context, Filter } from "grammy";
import { renderEpisodePage, renderAnimePage } from "@/services/render-page.ts";
import { abu, abup, anime, episode, channelPost } from "@/db/schema.ts";
import { cb, rowsToInlineKeyboard } from "@/services/keyboards.ts";
import { eq, and, gte, lte } from "drizzle-orm";
import { sendErrorLog } from "@/services/log.ts";
import { db } from "@/db/client.ts";
import { CHANNEL } from "@/utils/constants.ts";
import { counter } from "@/services/counter.ts";

const message2 = "❌ Kutilmagan xatolik yuz berdi. Iltimos, /start buyrug'ini bosing.";
const errorMsg = "❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.";

export const search = async (ctx: Context) => {
    try {
        const msg = ctx.message;
        if (!msg || !("text" in msg) || ctx.chat?.type !== "private") return;

        const message = msg.text;

        const whereCondition = eq(abu.tg_id, String(ctx.from!.id));
        const [u] = await db.select().from(abu).where(whereCondition).limit(1);
        if (!u) return await ctx.reply(message2);

        await db.update(abup).set({ anime_page: 0, episode_page: 0, searching: message }).where(eq(abup.user_id, u.id));

        const { textList, buttons } = await renderAnimePage(0, message);
        await ctx.reply(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
    } catch (error) {
        await ctx.reply(errorMsg);
        await sendErrorLog({ ctx, event: "search", error });
    }
};

export const reserFilter = async (ctx: Filter<Context, "callback_query">) => {
    try {
        const whereCondition = eq(abu.tg_id, String(ctx.from!.id));
        const [u] = await db.select().from(abu).where(whereCondition).limit(1);
        if (!u) return await ctx.reply(message2);

        await db.update(abup).set({ anime_page: 0, episode_page: 0, searching: "" }).where(eq(abup.user_id, u.id));

        const { textList, buttons } = await renderAnimePage(0, "");
        await ctx.editMessageText(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
    } catch (error) {
        await ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
        await sendErrorLog({ ctx, event: "reset_filter", error });
    }
};

export const changePage = async (ctx: Filter<Context, "callback_query">) => {
    try {
        const page = parseInt(ctx.match![1], 10);

        const whereCondition = eq(abu.tg_id, String(ctx.from.id));
        const [u] = await db.select().from(abu).where(whereCondition).limit(1);
        if (!u) return await ctx.reply(message2);

        const [updated] = await db.update(abup).set({ anime_page: page }).where(eq(abup.user_id, u.id)).returning();

        const { textList, buttons } = await renderAnimePage(page, updated?.searching || "");
        await ctx.editMessageText(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
    } catch (error) {
        await ctx.reply(errorMsg);
        await sendErrorLog({ ctx, event: "change_page", error });
    }
};

export const selectAnime = async (ctx: Filter<Context, "callback_query">) => {
    try {
        const animeID = parseInt(ctx.match![1], 10);

        const whereCondition = eq(abu.tg_id, String(ctx.from.id));
        const [u] = await db.select().from(abu).where(whereCondition).limit(1);
        if (!u) return await ctx.reply(message2);

        await db.update(abup).set({ anime_id: animeID, episode_page: 0 }).where(eq(abup.user_id, u.id));

        const [animeRow] = await db.select().from(anime).where(eq(anime.id, animeID)).limit(1);
        if (!animeRow) {
            await ctx.reply("❌ Topilmadi!");
            return;
        }

        if (animeRow.number_of_episode === 1) {
            const [ep] = await db.select().from(episode).where(eq(episode.anime_id, animeID)).limit(1);
            if (!ep || !CHANNEL) {
                await ctx.reply("❌ Topilmadi!");
                return;
            }

            const whereCondition = and(eq(episode.anime_id, ep.anime_id), eq(episode.episode, ep.episode));
            const allDub = await db.select().from(episode).where(whereCondition);

            if (allDub.length === 1) {
                const posts = await db.select().from(channelPost).where(eq(channelPost.episode_id, allDub[0]!.id));

                const chatId = ctx.chat!.id;
                for (let i = 0; i < posts.length; i++)
                    await ctx.api.copyMessage(chatId, CHANNEL, posts[i]!.post_id).catch(async (error) => {
                        await sendErrorLog({ ctx, event: "select_anime", error });
                        await ctx.reply("❌ Topilmadi!");
                    });
                await counter(ctx, ep.id, posts.length);

                const buttons = [[cb("📂 Animelar ro'yxati", "anime_list")]];
                await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
            } else {
                const buttons = allDub.map((d) => [cb(`🎙 ${d.dub}`, `watch_${d.id}`)]);
                const text = `🎥 <b>${ep.episode}. ${ep.name}</b>\n\nUshbu qism bir nechta dublyaj studiyasi tomonidan dublyaj qilingan:`;
                await ctx.reply(text, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
            }
        } else {
            const { textList, buttons } = await renderEpisodePage(animeID, 0);
            await ctx.reply(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
        }

        await ctx.deleteMessage();
    } catch (error) {
        await ctx.reply(errorMsg);
        await sendErrorLog({ ctx, event: "select_anime", error });
    }
};

export const episodePage = async (ctx: Filter<Context, "callback_query">) => {
    try {
        const animeId = parseInt(ctx.match![1], 10);
        const page = parseInt(ctx.match![2], 10);

        const whereCondition = eq(abu.tg_id, String(ctx.from.id));
        const [u] = await db.select().from(abu).where(whereCondition).limit(1);
        if (!u) return await ctx.reply(message2);

        await db.update(abup).set({ episode_page: page }).where(eq(abup.user_id, u.id));

        const { textList, buttons } = await renderEpisodePage(animeId, page);
        await ctx.editMessageText(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
    } catch (error) {
        await ctx.reply(errorMsg);
        await sendErrorLog({ ctx, event: "episode_page", error });
    }
};

export const selectEpisode = async (ctx: Filter<Context, "callback_query">) => {
    try {
        const id = Number(ctx.match![1]);
        const userId = ctx.from!.id;

        const whereCondition = eq(abu.tg_id, String(userId));
        const [u] = await db.select().from(abu).where(whereCondition).limit(1);
        if (!u) return await ctx.reply(message2);

        const [ep] = await db.select().from(episode).where(eq(episode.id, id)).limit(1);
        if (!ep) return await ctx.reply("❌ Topilmadi!");

        const whereCondition2 = and(eq(episode.anime_id, ep.anime_id), eq(episode.episode, ep.episode));
        const allDub = await db.select().from(episode).where(whereCondition2);

        if (allDub.length === 1) {
            const posts = await db.select().from(channelPost).where(eq(channelPost.episode_id, allDub[0]!.id));
            const chatId = ctx.chat!.id;
            for (let i = 0; i < posts.length; i++)
                await ctx.api.copyMessage(chatId, CHANNEL!, posts[i]!.post_id).catch(async (error) => {
                    await sendErrorLog({ ctx, event: "select_episode", error });
                    await ctx.reply("❌ Topilmadi!");
                });
            await counter(ctx, id, posts.length);

            const buttons = [[cb("📄 Qismlar ro'yxati", "episode_list")], [cb("📂 Animelar ro'yxati", "anime_list")]];
            await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
            await ctx.deleteMessage();
        } else {
            const buttons = allDub.map((d) => [cb(`🎙 ${d.dub}`, `watch_${d.id}`)]);
            const text = `🎥 <b>${ep.episode}. ${ep.name}</b>\n\nUshbu qism bir nechta dublyaj studiyasi tomonidan dublyaj qilingan:`;
            await ctx.reply(text, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
            await ctx.deleteMessage();
        }
    } catch (error) {
        await sendErrorLog({ ctx, event: "select_episode", error });
        await ctx.reply(errorMsg);
    }
};

export const selectAllEpisode = async (ctx: Filter<Context, "callback_query">) => {
    try {
        const id1 = Number(ctx.match![1]);
        const id2 = Number(ctx.match![2]);
        const userId = ctx.from!.id;

        const whereCondition = eq(abu.tg_id, String(userId));
        const [u] = await db.select().from(abu).where(whereCondition).limit(1);
        if (!u) return await ctx.reply(message2);

        const whereCondition2 = and(gte(episode.id, id1), lte(episode.id, id2));
        const episodes = await db.select().from(episode).where(whereCondition2);
        if (episodes.length === 0) return await ctx.reply("❌ Topilmadi!");

        const chatId = ctx.chat!.id;
        for (let i = 0; i < episodes.length; i++) {
            const ep = episodes[i]!;

            const whereCondition3 = and(eq(episode.anime_id, ep.anime_id), eq(episode.episode, ep.episode));
            const allDub = await db.select().from(episode).where(whereCondition3);

            for (let j = 0; j < allDub.length; j++) {
                const posts = await db.select().from(channelPost).where(eq(channelPost.episode_id, allDub[j]!.id));
                for (let k = 0; k < posts.length; k++) {
                    await ctx.api.copyMessage(chatId, CHANNEL!, posts[k]!.post_id).catch(async (error) => {
                        await sendErrorLog({ ctx, event: "select_all_episode", error });
                        await ctx.reply("❌ Topilmadi!");
                    });
                }
                await counter(ctx, allDub[j]!.id, posts.length);
            }
        }

        const buttons = [[cb("📄 Qismlar ro'yxati", "episode_list")], [cb("📂 Animelar ro'yxati", "anime_list")]];
        await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
        await ctx.deleteMessage();
    } catch (error) {
        await ctx.reply(errorMsg);
        await sendErrorLog({ ctx, event: "select_all_episode", error });
    }
};

export const backToAnime = async (ctx: Filter<Context, "callback_query">) => {
    try {
        const whereCondition = eq(abu.tg_id, String(ctx.from.id));
        const [u] = await db.select().from(abu).where(whereCondition).limit(1);
        if (!u) return await ctx.reply(message2);

        const [page] = await db.select().from(abup).where(eq(abup.user_id, u.id)).limit(1);

        const { textList, buttons } = await renderAnimePage(page?.anime_page || 0, page?.searching || "");
        await ctx.reply(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });

        await ctx.deleteMessage();
    } catch (error) {
        await ctx.reply(errorMsg);
        await sendErrorLog({ ctx, event: "back_to_anime", error });
    }
};

export const animeList = async (ctx: Filter<Context, "callback_query">) => {
    try {
        const whereCondition = eq(abu.tg_id, String(ctx.from.id));
        const [u] = await db.select().from(abu).where(whereCondition).limit(1);
        if (!u) return await ctx.reply(message2);

        const [page] = await db.select().from(abup).where(eq(abup.user_id, u.id)).limit(1);
        const { textList, buttons } = await renderAnimePage(page?.anime_page ?? 0, page?.searching ?? "");
        await ctx.reply(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
        await ctx.deleteMessage();
    } catch (error) {
        await ctx.reply(errorMsg);
        await sendErrorLog({ ctx, event: "anime_list", error });
    }
};

export const episodeList = async (ctx: Filter<Context, "callback_query">) => {
    try {
        const whereCondition = eq(abu.tg_id, String(ctx.from.id));
        const [u] = await db.select().from(abu).where(whereCondition).limit(1);
        if (!u) return await ctx.reply(message2);

        const [page] = await db.select().from(abup).where(eq(abup.user_id, u.id)).limit(1);

        const { textList, buttons } = await renderEpisodePage(page?.anime_id ?? 0, page?.episode_page ?? 0);
        await ctx.reply(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
        await ctx.deleteMessage();
    } catch (error) {
        await ctx.reply(errorMsg);
        await sendErrorLog({ ctx, event: "episode_list", error });
    }
};

export const watch = async (ctx: Filter<Context, "callback_query">) => {
    try {
        const id = Number(ctx.match![1]);
        const userId = ctx.from!.id;

        await ctx.deleteMessage();

        const whereCondition = eq(abu.tg_id, String(userId));
        const [u] = await db.select().from(abu).where(whereCondition).limit(1);
        if (!u) return await ctx.reply(message2);

        const chatId = ctx.chat!.id;
        const [ep] = await db.select().from(episode).where(eq(episode.id, id)).limit(1);
        if (ep && CHANNEL) {
            const posts = await db.select().from(channelPost).where(eq(channelPost.episode_id, ep.id));
            for (let i = 0; i < posts.length; i++) await ctx.api.copyMessage(chatId, CHANNEL, posts[i]!.post_id);
            await counter(ctx, id, posts.length);
        } else return await ctx.reply("❌ Topilmadi!");

        const buttons = [[cb("📄 Qismlar ro'yxati", "episode_list")], [cb("📂 Animelar ro'yxati", "anime_list")]];
        await ctx.reply("Quyidagi menulardan birini tanlang 👇", { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
    } catch (error) {
        await ctx.reply(errorMsg);
        await sendErrorLog({ ctx, event: "watch", error });
    }
};
