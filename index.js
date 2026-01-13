const env = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
require("dotenv").config({ path: env });

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

const { start } = require("./src/start");
const { watch } = require("./src/methods.js");
const { search } = require("./src/methods.js");
const { reserFilter } = require("./src/methods.js");
const { handleMessage } = require("./src/auth.js");
const { episodePage } = require("./src/methods.js");
const { selectEpisode } = require("./src/methods.js");
const { backToAnime } = require("./src/methods.js");
const { changePage } = require("./src/methods.js");
const { selectAnime } = require("./src/methods.js");
const { animeList } = require("./src/methods.js");
const { episodeList } = require("./src/methods.js");
const { sendDataToAdmin } = require("./src/scheduler.js");
const { selectAllEpisode } = require("./src/methods.js");
const { sendUserActivity } = require("./src/scheduler.js");
const { userActivity } = require("./src/middlewares.js");

//  to-do: no forward message

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
