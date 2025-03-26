require("dotenv").config();

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

const { start } = require("./src/start");
const { watch } = require("./src/methods.js");
const { handleMessage } = require("./src/auth.js");
const { episodePage } = require("./src/methods.js");
const { selectEpisode } = require("./src/methods.js");
const { backToAnime } = require("./src/methods.js");
const { changePage } = require("./src/methods.js");
const { selectAnime } = require("./src/methods.js");
const { animeList } = require("./src/methods.js");
const { episodeList } = require("./src/methods.js");
const { sendDataToAdmin } = require("./src/scheduler.js");

bot.start(start);
bot.on("message", handleMessage);
bot.action(/^anime_(\d+)$/, selectAnime);
bot.action(/^anime_list_(\d+)$/, changePage);
bot.action(/^back_anime_list$/, backToAnime);
bot.action(/^episode_(\d+)$/, selectEpisode);
bot.action(/^elist_(\d+)_(\d+)$/, episodePage);
bot.action(/^episode_list$/, episodeList);
bot.action(/^anime_list$/, animeList);
bot.action(/^watch_(.+)$/, watch);

sendDataToAdmin();

bot.launch();
