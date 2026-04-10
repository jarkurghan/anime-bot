import type { Context } from "grammy";

export function getStartPayload(ctx: Context): string {
    const text = ctx.message?.text;
    if (!text?.startsWith("/start")) return "";
    const m = text.match(/^\/start(?:\s+(.+))?$/s);
    return m?.[1]?.trim() || "";
}

export function resolveUtmFromStartPayload(startPayload: string): string {
    const p = startPayload.trim();
    if (!p) return "";

    if (p.includes("utm-")) {
        const utm = p.slice(p.indexOf("utm-") + 4);
        if (utm.includes("ikki_moviy_girdob") return "@ikki_moviy_girdob";
        else if (utm.includes("karyera") return "@meni_botlarim";
        else return utm;
    }

    if (p.slice(0, 5) === "manga") return "Manga kanaldan";
    if (p.slice(0, 11) === "watch_anime") return "Anime ko'rish kanalidan";
    return p;
}
