import "./load-env.js";
import { Telegraf } from "telegraf";
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

const bot = new Telegraf(process.env.BOT_TOKEN);

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
