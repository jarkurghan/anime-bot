import { Bot, webhookCallback } from "grammy";
import { BOT_TOKEN } from "@/utils/constants.ts";
import { botStart } from "@/handlers/register-start-command.ts";
import { errorHandler } from "./handlers/register-error-handler.ts";
import { registerChatMember } from "@/handlers/register-chat-member.ts";
import { selectAllEpisode } from "@/handlers/callback-queries.ts";
import { selectEpisode } from "@/handlers/callback-queries.ts";
import { reserFilter } from "@/handlers/callback-queries.ts";
import { episodePage } from "@/handlers/callback-queries.ts";
import { backToAnime } from "@/handlers/callback-queries.ts";
import { selectAnime } from "@/handlers/callback-queries.ts";
import { episodeList } from "@/handlers/callback-queries.ts";
import { changePage } from "@/handlers/callback-queries.ts";
import { animeList } from "@/handlers/callback-queries.ts";
import { search } from "@/handlers/callback-queries.ts";
import { watch } from "@/handlers/callback-queries.ts";

if (!BOT_TOKEN) throw new Error("BOT_TOKEN topilmadi!");
export const bot = new Bot(BOT_TOKEN);

bot.command("start", botStart);

bot.callbackQuery(/^anime_(\d+)$/, selectAnime);
bot.callbackQuery(/^anime_list_(\d+)$/, changePage);
bot.callbackQuery(/^back_anime_list$/, backToAnime);
bot.callbackQuery(/^anime_list$/, animeList);

bot.callbackQuery(/^episode_(\d+)$/, selectEpisode);
bot.callbackQuery(/^all_episode_(\d+)_(\d+)$/, selectAllEpisode);
bot.callbackQuery(/^elist_(\d+)_(\d+)$/, episodePage);
bot.callbackQuery(/^episode_list$/, episodeList);

bot.callbackQuery(/^watch_(.+)$/, watch);

bot.on("message", search);
bot.callbackQuery(/^remove_searching$/, reserFilter);

bot.on("my_chat_member", registerChatMember);

bot.catch(errorHandler);

export const handleUpdate = webhookCallback(bot, "hono");

// export function startBot() {
//     console.log("Bot is running...");
//     return bot.start();
// }
