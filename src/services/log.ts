import type { ErrorLogOptions, LogOptions } from "@/utils/types.ts";
import { ADMIN_CHAT_ID, LOG_CHANNEL_ID } from "@/utils/constants.ts";
import { groupLink, userLink } from "@/services/save-user.ts";
import { GrammyError } from "grammy";
import { bot } from "@/bot.ts";

function escapeForTelegramHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function formatLogError(err: unknown): string {
    if (err instanceof Error) {
        const text = err.stack || err.message;
        return escapeForTelegramHtml(text);
    }
    return escapeForTelegramHtml(String(err));
}

export const sendLog = async (message: string, options?: LogOptions) => {
    try {
        const { parse_mode = "HTML", reply_to_message_id } = options || {};

        if (reply_to_message_id) {
            await bot.api.sendMessage(LOG_CHANNEL_ID, message, {
                parse_mode: parse_mode,
                reply_parameters: { message_id: reply_to_message_id },
            });
        } else {
            await bot.api.sendMessage(LOG_CHANNEL_ID, message, {
                parse_mode: parse_mode,
            });
        }
    } catch (error) {
        console.error("sendLog xatosi:", error);
    }
};

export const sendErrorLog = async (options: ErrorLogOptions) => {
    try {
        const { ctx, event, error } = options;
        const from = ctx?.from;
        const chat = ctx?.chat;

        let logMessage = "";
        if (error instanceof Error) {
            logMessage = escapeForTelegramHtml(error.stack || error.message);
        } else if (error instanceof GrammyError) {
            logMessage = escapeForTelegramHtml(error.description || error.message);
        } else {
            logMessage = escapeForTelegramHtml(String(error));
        }

        const lines: string[] = [`💣 <b>Xatolik:</b>\n`, `📍 Qayerda: ${event}`, `🔦 Tafsilot: ${logMessage}`];

        if (chat && (chat.type === "group" || chat.type === "supergroup" || chat.type === "channel")) {
            const kind = chat.type === "channel" ? "Kanal" : chat.type === "group" ? "Guruh" : "Superguruh";
            lines.push(`💬 Chat turi: ${kind}`);
            lines.push(`🆔 Chat ID: <code>${chat.id}</code>`);
            lines.push(`📢 Chat: ${groupLink(chat)}`);
        } else if (chat && chat.type === "private") {
            lines.push(`💬 Chat turi: Shaxsiy`);
        }

        if (from) {
            const tg_id = String(from.id);
            const { first_name, last_name = "", username = "" } = from;
            const userlink = userLink({ tg_id, first_name, last_name, username });

            lines.push(`🆔 User ID: <code>${tg_id}</code>`);
            lines.push(`👤 User: ${userlink}`);
        }

        await sendLog(lines.join("\n"), { parse_mode: "HTML" });
    } catch (error) {
        console.error("System error:", error);
    }
};

export const sendAdmin = async (message: string, options?: LogOptions) => {
    try {
        const { parse_mode = "HTML", reply_to_message_id } = options || {};

        if (reply_to_message_id) {
            await bot.api.sendMessage(ADMIN_CHAT_ID, message, {
                parse_mode: parse_mode,
                reply_parameters: { message_id: reply_to_message_id },
            });
        } else {
            await bot.api.sendMessage(ADMIN_CHAT_ID, message, {
                parse_mode: parse_mode,
            });
        }
    } catch (error) {
        console.log(error);
        await sendErrorLog({ event: "Adminga xabar yuborishda", error });
    }
};
