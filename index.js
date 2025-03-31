require("dotenv").config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env" });

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
bot.on("channel_post", (ctx) => {
    const post = ctx.channelPost;
    console.log(post);

    // Post matniga yangi qator qo'shish
    // const updatedText = post.text + "\n\n✅ Ushbu post bot orqali qayta ishlandi";

    // Tahrirlash (agar bot admin bo'lsa)
    // ctx.editMessageText(updatedText).catch((err) => {
    //     console.error("Postni tahrirlashda xato:", err);
    // });
});

bot.action(/^anime_(\d+)$/, handleMessage, selectAnime);
bot.action(/^anime_list_(\d+)$/, handleMessage, changePage);
bot.action(/^back_anime_list$/, handleMessage, backToAnime);
bot.action(/^episode_(\d+)$/, handleMessage, selectEpisode);
bot.action(/^elist_(\d+)_(\d+)$/, handleMessage, episodePage);
bot.action(/^episode_list$/, handleMessage, episodeList);
bot.action(/^anime_list$/, handleMessage, animeList);
bot.action(/^watch_(.+)$/, handleMessage, watch);

sendDataToAdmin(bot);

bot.launch();
