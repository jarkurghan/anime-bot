import type { Context } from "telegraf";
import type { ContextWithStartPayload } from "./types.js";
import { Markup } from "telegraf";
import { db } from "../db/client.js";
import { user, userPage } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { checkSubscription } from "./check-subscription.js";
import { renderAnimePage } from "./render-page.js";
import { sendManga } from "./manga.js";
import { logError } from "../logger/index.js";
import { sendAnime } from "./request-from-channel.js";

const requiredChannels = [{ username: process.env.MY_CHANNEL_USERNAME, name: process.env.MY_CHANNEL_NAME }];

async function createUserDB(ctx: Context): Promise<void> {
    const from = ctx.from;
    if (!from) return;
    const { id: user_id, username, first_name, last_name } = from;
    const newUser = {
        userId: user_id,
        username,
        firstName: first_name,
        lastName: last_name,
    };

    const [existingUser] = await db.select().from(user).where(eq(user.userId, user_id)).limit(1);
    try {
        if (!existingUser) {
            await ctx.reply("Botga xush kelibsiz! 🎉\n\n", Markup.removeKeyboard());
            const [dbUser] = await db.insert(user).values(newUser).returning();
            await db.insert(userPage).values({ userId: dbUser!.id });
            const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
            if (ADMIN_CHAT_ID) {
                await ctx.telegram.sendMessage(
                    ADMIN_CHAT_ID,
                    `🆕 Yangi foydalanuvchi:\n\n` +
                        `👤 Ism: ${first_name ?? "Noma'lum"} ${last_name ?? ""}\n` +
                        `🔗 Username: ${username ? `@${username}` : "Noma'lum"}\n` +
                        `🆔 ID: ${user_id}`
                );
            }
        }
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("start_add_user", error);
        void ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    }
}

async function start(ctx: ContextWithStartPayload): Promise<void> {
    await createUserDB(ctx);
    if (!ctx.from) return;
    const [existingUser] = await db.select().from(user).where(eq(user.userId, ctx.from.id)).limit(1);

    const notSubscribed = await checkSubscription(ctx);

    if (notSubscribed.length > 0) {
        await ctx.reply(
            "❌ Botdan foydalanish uchun quyidagi kanal" + (requiredChannels.length > 1 ? "lar" : "") + "ga a'zo bo'ling:",
            Markup.inlineKeyboard(notSubscribed.map((channel) => [{ text: channel.name ?? "", url: `https://t.me/${channel.username?.slice(1) ?? ""}` }]))
        );
        return;
    }

    if (ctx.startPayload && ctx.startPayload.slice(0, 5) === "manga") {
        const manga = await sendManga(ctx);
        if (manga) return;
    }

    if (ctx.startPayload && ctx.startPayload.slice(0, 11) === "watch_anime") {
        const animeResult = await sendAnime(ctx);
        if (animeResult) return;
    }

    const [up] = existingUser ? await db.select().from(userPage).where(eq(userPage.userId, existingUser.id)).limit(1) : [null];
    const userPageDefaults = up ?? { animePage: 0, searching: "" };
    const { textList, buttons } = await renderAnimePage(userPageDefaults.animePage ?? 0, userPageDefaults.searching ?? "");
    await ctx.reply(textList, { parse_mode: "HTML", ...Markup.inlineKeyboard(buttons) });
}

export { start };
