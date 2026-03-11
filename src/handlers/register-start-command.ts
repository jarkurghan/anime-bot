import type { Context } from "grammy";

import { sendAnime } from "@/services/request-from-channel.ts";
import { rowsToInlineKeyboard } from "@/services/keyboards.ts";
import { getStartPayload } from "@/services/start-payload.ts";
import { renderAnimePage } from "@/services/render-page.ts";
import { sendManga } from "@/services/manga.ts";
import { saveUser } from "@/services/save-user.ts";
import { abup } from "@/db/schema.ts";
import { db } from "@/db/client.ts";
import { eq } from "drizzle-orm";
import { sendErrorLog } from "@/services/log.ts";

export async function botStart(ctx: Context) {
    try {
        if (!ctx.from) return;

        console.log(ctx.from.id);

        const [user] = await saveUser(ctx);
        if (!user) return;

        const startPayload = getStartPayload(ctx);

        if (startPayload.slice(0, 5) === "manga") {
            const manga = await sendManga(ctx, startPayload);
            if (manga) return;
        }

        if (startPayload.slice(0, 11) === "watch_anime") {
            const animeResult = await sendAnime(ctx, startPayload);
            if (animeResult) return;
        }

        const [up] = user ? await db.select().from(abup).where(eq(abup.user_id, user.id!)).limit(1) : [null];
        const userPageDefaults = up || { anime_page: 0, searching: "" };

        const { textList, buttons } = await renderAnimePage(userPageDefaults.anime_page || 0, userPageDefaults.searching || "");
        await ctx.reply(textList, { parse_mode: "HTML", reply_markup: rowsToInlineKeyboard(buttons) });
    } catch (error) {
        await ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
        await sendErrorLog({ ctx, event: "bot_start", error });
    }
}
