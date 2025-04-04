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
const { selectAllEpisode } = require("./src/methods.js");

bot.start(start);
// bot.on("channel_post", async (ctx) => {
//     // const post = ctx.channelPost;
//     // if (post.sender_chat.id == process.env.CHANNEL_ID && post.text === process.env.SENDKEY) {
//     //     sendPostToChannel();
//     // }

//     try {
//         const messageId = ctx.channelPost.message_id;
//         const originalText = ctx.channelPost.text || ctx.channelPost.caption || "";
//         // console.log(ctx.channelPost);

//         // console.log(`Kanalda yangi post: ${messageId}`);

//         await bot.telegram.editMessageText("-1002198562196", messageId, null, originalText, {
//             reply_markup: { inline_keyboard: [[{ text: "Botga o'tish", url: `https://t.me/aniuz_bot?start=channel` }]] },
//             parse_mode: "HTML",
//         });

//         console.log(`Post muvaffaqiyatli tahrirlandi: ${messageId}`);
//     } catch (error) {
//         console.error("Postni tahrirlashda xato:", error.message);
//     }
// });

bot.action(/^anime_(\d+)$/, handleMessage, selectAnime);
bot.action(/^anime_list_(\d+)$/, handleMessage, changePage);
bot.action(/^back_anime_list$/, handleMessage, backToAnime);
bot.action(/^episode_(\d+)$/, handleMessage, selectEpisode);
bot.action(/^all_episode_(\d+)_(\d+)$/, handleMessage, selectAllEpisode);
bot.action(/^elist_(\d+)_(\d+)$/, handleMessage, episodePage);
bot.action(/^episode_list$/, handleMessage, episodeList);
bot.action(/^anime_list$/, handleMessage, animeList);
bot.action(/^watch_(.+)$/, handleMessage, watch);

sendDataToAdmin(bot);

bot.launch();
