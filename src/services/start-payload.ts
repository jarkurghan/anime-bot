import type { Context } from "grammy";
import { anime, episode } from "@/db/schema.ts";
import { db } from "@/db/client.ts";
import { eq } from "drizzle-orm";

async function findChannel(payload: string): Promise<string> {
    if (payload.includes("example")) return "Qarmoq! @example";
    else if (payload.includes("example")) return "Qarmoq! @example";

    const episodeID = payload.slice(12);
    const whereCondition = eq(episode.id, Number(episodeID));
    const [ep] = await db.select().from(episode).where(whereCondition).limit(1);
    if (!ep) return "Qarmoq!";

    const [an] = await db.select().from(anime).where(eq(anime.id, ep.anime_id)).limit(1);
    if (!an) return "Qarmoq!";

    return "Qarmoq! " + an.name;
}

export function getStartPayload(ctx: Context): string {
    const text = ctx.message?.text;
    if (!text?.startsWith("/start")) return "";
    const m = text.match(/^\/start(?:\s+(.+))?$/s);
    return m?.[1]?.trim() || "";
}

/**
 * https://t.me/aniuz_bot?start=watch_anime_539
 * shunday linklar tarqalib ketgani uchun, object ko'rinishiga o'tkazib bo'lmaydi
 */
export async function resolveUtmFromStartPayload(startPayload: string): Promise<string> {
    const p = startPayload.trim();
    if (!p) return "";

    if (p.includes("utm-")) {
        const utm = p.slice(p.indexOf("utm-") + 4);
        if (utm.includes("karyera")) return "@meni_botlarim";
        else if (utm.includes("ikki_moviy_girdob")) return "@ikki_moviy_girdob";
        else if (utm.includes("ikkii_moviy_girdob")) return "@ikkii_moviy_girdob";
        else if (utm.includes("ani_uz_news")) return "@ani_uz_news";
        else return utm;
    }

    if (p.slice(0, 5) === "manga") return "Manga kanaldan";
    if (p.slice(0, 11) === "watch_anime") return await findChannel(p);
    return p;
}
