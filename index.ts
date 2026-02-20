import "./load-env.ts";
import { Telegraf } from "telegraf";
import { start } from "./src/start.ts";
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
} from "./src/methods.ts";
import { handleMessage } from "./src/auth.ts";
import { sendDataToAdmin, sendUserActivity } from "./src/scheduler.ts";
import { userActivity } from "./src/middlewares.ts";

const token = process.env.BOT_TOKEN;
if (!token) {
    console.error("BOT_TOKEN is not set");
    process.exit(1);
}

const bot = new Telegraf(token);

bot.start(start);
bot.use(userActivity);
bot.action(/^anime_(\d+)$/, handleMessage, selectAnime);
bot.action(/^anime_list_(\d+)$/, handleMessage, changePage);
bot.action(/^back_anime_list$/, handleMessage, backToAnime);
bot.action(/^episode_(\d+)$/, handleMessage, selectEpisode);
bot.action(/^all_episode_(\d+)_(\d+)$/, handleMessage, selectAllEpisode);
bot.action(/^elist_(\d+)_(\d+)$/, handleMessage, episodePage);
bot.action(/^episode_list$/, handleMessage, episodeList);
bot.action(/^anime_list$/, handleMessage, animeList);
bot.action(/^watch_(.+)$/, handleMessage, watch);
bot.action(/^remove_searching$/, reserFilter);
bot.on("message", search);

sendDataToAdmin(bot);
sendUserActivity(bot);

bot.launch(() => console.log("Bot ishga tushdi."));
