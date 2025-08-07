const schedule = require("node-schedule");
const fs = require("fs");
const path = require("path");
const knex = require("../db/db");
const user_db = require("../db/user-db");
const { logError } = require("../logger");

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const FOLDER_NAME = process.env.NODE_ENV === "production" ? "db" : "drafts";

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
    schedule.scheduleJob("10 0 * * *", async () => {
        try {
            const user = await knex("user").select("*");
            const anime = await knex("anime").select("*");
            const episode = await knex("episode").select("*");
            const dub = await knex("dub").select("*");
            const data = { user, anime, episode, dub };

            const JSONFilePath = path.join(__dirname, `../${FOLDER_NAME}/database-to-json.json`);
            await fs.promises.writeFile(JSONFilePath, JSON.stringify(data, null, 2));
            await bot.telegram.sendDocument(ADMIN_CHAT_ID, { source: JSONFilePath }, { caption: "Ma'lumotlar bazasi json fayli." });
            await fs.promises.unlink(JSONFilePath);

            const errorDir = path.join(__dirname, "../logger/logs");
            const errors = await countFilesInDirectory(errorDir);

            const message =
                `📌 Foydalanuvchilar: <b>${user.length} ta</b>\n` +
                `🔢 Animelar: <b>${anime.length} ta</b>\n` +
                `🎞 Barcha qismlar: <b>${episode.length} ta</b>\n` +
                `🎙 Dublyaj studiyalari: <b>${dub.length} ta</b>\n` +
                `🔢 Xatoliklar: <b>${errors} ta</b>\n` +
                `🤖 Bot: <b>@${process.env.BOT_USERNAME}</b>\n`;
            await bot.telegram.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: "HTML" });

            console.log("✅ scheduler");
        } catch (error) {
            console.error(error.message);
            logError("scheduler", error);
        }
    });
};

const sendUserActivity = (bot) => {
    schedule.scheduleJob("11 0 * * *", async () => {
        try {
            const date = new Date();
            date.setDate(date.getDate() - 1);
            const yesterday = date.toISOString().slice(0, 10);

            const users = await user_db("anime_bot").where({ date: yesterday }).select("*").orderBy("clicked", "desc");

            const JSONFilePath = path.join(__dirname, `../${FOLDER_NAME}/bir-kunlik-aktiv-foydalanuvchilar-hisoboti.json`);
            await fs.promises.writeFile(JSONFilePath, JSON.stringify(users, null, 2));
            await bot.telegram.sendDocument(ADMIN_CHAT_ID, { source: JSONFilePath }, { caption: "Bir kunlik aktiv foydalanuvchilar hisoboti" });
            await fs.promises.unlink(JSONFilePath);

            if (users.length === 0) {
                const message = `📌 Aktiv foydalanuvchilar: <b>@${process.env.BOT_USERNAME}</b>\n\nBir kun ichida hech kim botdan foydalanmadi`;
                await bot.telegram.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: "HTML" });
            } else if (users.length > 30) {
                const message = `📌 Aktiv foydalanuvchilar: <b>@${process.env.BOT_USERNAME}</b>\n\nBir kun ichida aktiv foydalanuvchilar soni 30dan ko'p. Batafsil bilib olish uchun hisobotga qarang`;
                await bot.telegram.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: "HTML" });
            } else {
                const message =
                    `📌 Aktiv foydalanuvchilar: <b>@${process.env.BOT_USERNAME}</b>\n\n` +
                    users.map((u) => `✅ ${u.tg_username ? `@${u.tg_username}` : `${u.tg_user_id}: ${u.tg_name}`} <b>⭐️${u.clicked}</b>`).join("\n");
                await bot.telegram.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: "HTML" });
            }

            console.log("✅ user activity scheduler");
        } catch (error) {
            console.error(error.message);
            logError("scheduler", error);
        }
    });

    schedule.scheduleJob("12 0 1 * *", async () => {
        try {
            const date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const nodays = new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate();

            const table = await user_db("anime_bot").where("date", "<", date).select("*");
            const users = await user_db("anime_bot").where("date", "<", date).select("tg_user_id").sum("clicked as total_clicked").groupBy("tg_user_id");
            const total_clicked = users.reduce((sum, user) => sum + user.total_clicked, 0);
            users.sort((a, b) => b.total_clicked - a.total_clicked);

            const JSONFilePath = path.join(__dirname, `../${FOLDER_NAME}/bir-oylik-aktiv-foydalanuvchilar-hisoboti.json`);
            await fs.promises.writeFile(JSONFilePath, JSON.stringify({ sorted: users, all: table }, null, 2));
            await bot.telegram.sendDocument(ADMIN_CHAT_ID, { source: JSONFilePath }, { caption: "Bir kunlik aktiv foydalanuvchilar hisoboti" });
            await fs.promises.unlink(JSONFilePath);

            if (users.length === 0) {
                const message = `📌 Aktiv foydalanuvchilar: <b>@${process.env.BOT_USERNAME}</b>\n\nBir oy ichida hech kim botdan foydalanmadi`;
                await bot.telegram.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: "HTML" });
            } else {
                const message =
                    `📌 Aktiv foydalanuvchilar: <b>@${process.env.BOT_USERNAME}</b>\n\n` +
                    `👤 Soni: <b>${users.length} kishi</b>\n` +
                    `📆 Kunlik (o'rtacha): <b>${(table.length / nodays).toFixed(1)} kishi</b>\n` +
                    `🔢 Umumiy foydalanish: <b>${total_clicked} marta</b>\n\n` +
                    `👇 Eng faollar: <b>${dub.length} ta</b>\n` +
                    users
                        .slice(0, 10)
                        .map((u) => `✅ ${u.tg_username ? `@${u.tg_username}` : `${u.tg_user_id}: ${u.tg_name}`} <b>⭐️${u.total_clicked}</b>`)
                        .join("\n");

                await bot.telegram.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: "HTML" });
            }

            await user_db("anime_bot").where("date", "<", date).del();
            console.log("✅ user activity scheduler");
        } catch (error) {
            console.error(error.message);
            logError("scheduler", error);
        }
    });
};

module.exports = { sendDataToAdmin, sendUserActivity };
