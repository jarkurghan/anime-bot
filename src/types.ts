import type { Context } from "grammy";

/** Regex `callback_query` handler — Grammy `ctx.match` */
export type MatchedContext = Context & { match: RegExpMatchArray };
