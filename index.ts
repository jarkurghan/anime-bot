import "./load-env.js";
import type { Context, Middleware } from "grammy";
import { Bot, Composer } from "grammy";
import { start } from "./src/start.js";
import {
    watch,
    search,
    reserFilter,
    episodePage,
    selectEpisode,
    backToAnime,
    changePage,
    selectAnime,
    animeList,
    episodeList,
    selectAllEpisode,
} from "./src/methods.js";
import { handleMessage } from "./src/auth.js";
import { sendDataToAdmin, sendUserActivity } from "./src/scheduler.js";
import { userActivity } from "./src/middlewares.js";

const token = process.env.BOT_TOKEN;
if (!token) {
    console.error("BOT_TOKEN is not set");
    process.exit(1);
}

const bot = new Bot(token);

bot.command("start", start);

bot.use(userActivity);

function withAuth(second: Middleware<Context>): Composer<Context> {
    const c = new Composer<Context>();
    c.use(handleMessage);
    c.use(second);
    return c;
}

bot.callbackQuery(/^anime_(\d+)$/, withAuth(selectAnime as Middleware<Context>));
bot.callbackQuery(/^anime_list_(\d+)$/, withAuth(changePage as Middleware<Context>));
bot.callbackQuery(/^back_anime_list$/, withAuth(backToAnime as Middleware<Context>));
bot.callbackQuery(/^episode_(\d+)$/, withAuth(selectEpisode as Middleware<Context>));
bot.callbackQuery(/^all_episode_(\d+)_(\d+)$/, withAuth(selectAllEpisode as Middleware<Context>));
bot.callbackQuery(/^elist_(\d+)_(\d+)$/, withAuth(episodePage as Middleware<Context>));
bot.callbackQuery(/^episode_list$/, withAuth(episodeList as Middleware<Context>));
bot.callbackQuery(/^anime_list$/, withAuth(animeList as Middleware<Context>));
bot.callbackQuery(/^watch_(.+)$/, withAuth(watch as Middleware<Context>));
bot.callbackQuery(/^remove_searching$/, reserFilter as Middleware<Context>);

bot.on("message", search);

sendDataToAdmin(bot);
sendUserActivity(bot);

bot.start();
console.log("Bot ishga tushdi.");
