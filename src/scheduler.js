const schedule = require("node-schedule");
const fs = require("fs");
const path = require("path");
const knex = require("../db/db");
const { logError } = require("../logger");

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

function countFilesInDirectory(directoryPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, (err, files) => {
            if (err) reject(err);
            else {
                const fileCount = files.filter((file) => fs.statSync(path.join(directoryPath, file)).isFile()).length;
                resolve(fileCount);
            }
        });
    });
}

const sendDataToAdmin = (bot) => {
    const time = process.env.NODE_ENV === "production2" ? "20 0 * * *" : "10 0 * * *";
    schedule.scheduleJob(time, async () => {
        try {
            const user = await knex("user").select("*");
            const anime = await knex("anime").select("*");
            const episode = await knex("episode").select("*");
            const dub = await knex("dub").select("*");
            const data = { user, anime, episode, dub };

            const papka = process.env.NODE_ENV === "production" ? "db" : "drafts";
            const JSONFilePath = path.join(__dirname, `../${papka}/dump.json`);
            // const DBFilePath = path.join(__dirname, process.env.DATABASE);

            await fs.promises.writeFile(JSONFilePath, JSON.stringify(data, null, 2));
            // await bot.telegram.sendDocument(ADMIN_CHAT_ID, { source: DBFilePath }, { caption: "Ma'lumotlar bazasi" });
            await bot.telegram.sendDocument(ADMIN_CHAT_ID, { source: JSONFilePath }, { caption: "Ma'lumotlar bazasi json fayli." });
            await fs.promises.unlink(JSONFilePath);

            const errorDir = path.join(__dirname, "../logger/logs");
            const errors = await countFilesInDirectory(errorDir);

            const message =
                `📌 <i>Foydalanuvchilar: <b>${user.length} ta</b></i>\n` +
                `🔢 <i>Animelar: <b>${anime.length} ta</b></i>\n` +
                `🎞 <i>Barcha qismlar: <b>${episode.length} ta</b></i>\n` +
                `🎙 <i>Dublyaj studiyalari: <b>${dub.length} ta</b></i>\n` +
                `🔢 <i>Xatoliklar: <b>${errors} ta</b></i>\n` +
                `🤖 <i>Bot: <b>@${process.env.BOT_USERNAME}</b></i>\n`;
            await bot.telegram.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: "HTML" });

            console.log("✅ scheduler");
        } catch (error) {
            console.error(error.message);
            logError("scheduler", error);
        }
    });
};

module.exports = { sendDataToAdmin };
