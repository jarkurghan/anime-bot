import type { Context } from "grammy";
import { USER_STATUS } from "@/utils/constants.ts";
import { ParseMode } from "grammy/types";

export type MatchedContext = Context & { match: RegExpMatchArray };

export type UserStatus = (typeof USER_STATUS)[number];

export interface User {
    id?: number;
    tg_id: string | number;
    first_name: string;
    last_name: string | null;
    username: string | null;
    today_count?: number;
    total_count?: number;
    status?: UserStatus;
}

export type LogOptions = { parse_mode?: ParseMode; reply_to_message_id?: number };
export type ErrorLogOptions = { ctx?: Context; event: string; error: unknown; reply_to_message_id?: number; parse_mode?: ParseMode };
