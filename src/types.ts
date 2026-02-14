import type { Context } from "telegraf";

/** `bot.action` / `bot.on` handlerlarida `match` mavjud bo‘lganda */
export type MatchedContext = Context & { match: RegExpExecArray };

/** `/start` deep link */
export type ContextWithStartPayload = Context & { startPayload?: string };
