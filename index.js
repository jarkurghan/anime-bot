require("dotenv").config();

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

const { start } = require("./src/start");
const { sendVideo } = require("./src/send-video");
const { handleMessage } = require("./src/message.js");
const { changeSeasonAction } = require("./src/change-season");
const { changeSeason } = require("./src/change-season");
const { sendToAll } = require("./src/send-to-all");
const { search } = require("./src/search");
const { watch } = require("./src/watch");
const { info } = require("./src/info");
const { changePage } = require("./src/anime-page.js");

const actions = { sendToAll: { flag: false, time: new Date() } };

bot.start(start);
bot.on("message", handleMessage);
bot.hears("📂 Boshqa mavsum", changeSeason);
bot.action(/season_(.+)/, changeSeasonAction);
bot.hears("🔍 Qidirish", search);
bot.hears("📄 Mavsum haqida", info);
bot.hears("moh2004", sendToAll);
bot.on("text", sendVideo);
bot.action(/^watch_(\d+)_(.+)$/, watch);
bot.action(/anime_list_(\d+)/, changePage);

bot.launch();

exports.actions = actions;
