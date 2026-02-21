import type { Context } from "grammy";

/** `/start payload` qatori */
export function getStartPayload(ctx: Context): string | undefined {
    const text = ctx.message?.text;
    if (!text?.startsWith("/start")) return undefined;
    const m = text.match(/^\/start(?:\s+(.+))?$/s);
    return m?.[1]?.trim() || undefined;
}
