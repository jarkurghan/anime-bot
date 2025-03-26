const schedule = require("node-schedule");
const fs = require("fs");
const path = require("path");
const db = require("../db/db");
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID; 

const sendDataToAdmin = () => {
    schedule.scheduleJob("0 0 * * *", async () => {
        try {
            const users = await db("user").select("*");
            const anime = await db("anime").select("*");
            const episodes = await db("episode").select("*");

            const data = { users, anime, episodes };
            const filePath = path.join(__dirname, "../data/dump.json");
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

            await bot.telegram.sendDocument(ADMIN_CHAT_ID, { source: filePath }, { caption: "📂 Har kungi ma'lumotlar bazasi dump fayli." });

            console.log("✅ JSON fayl yaratildi va admin chatga yuborildi.");
        } catch (error) {
            console.error("❌ Xatolik yuz berdi:", error);
        }
    });
};

module.exports = { sendDataToAdmin };
