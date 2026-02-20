import type { Telegraf } from "telegraf";
import schedule from "node-schedule";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "../db/client.ts";
import { userDb } from "../db/user-client.ts";
import { user, anime, episode, dub, animeBot } from "../db/schema.ts";
import { eq, lt, desc, sum } from "drizzle-orm";
import { logError } from "../logger/index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const FOLDER_NAME = process.env.NODE_ENV === "production" ? "db" : "drafts";

function countFilesInDirectory(directoryPath: string): Promise<number> {
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

const sendDataToAdmin = (bot: Telegraf): void => {
    if (!ADMIN_CHAT_ID) return;
    schedule.scheduleJob("10 0 * * *", async () => {
        try {
            const userRows = await db.select().from(user);
            const animeRows = await db.select().from(anime);
            const episodeRows = await db.select().from(episode);
            const dubRows = await db.select().from(dub);
            const data = { user: userRows, anime: animeRows, episode: episodeRows, dub: dubRows };

            const JSONFilePath = path.join(__dirname, `../${FOLDER_NAME}/database-to-json.json`);
            await fs.promises.writeFile(JSONFilePath, JSON.stringify(data, null, 2));
            await bot.telegram.sendDocument(ADMIN_CHAT_ID, { source: JSONFilePath }, { caption: "Ma'lumotlar bazasi json fayli." });
            await fs.promises.unlink(JSONFilePath);

            const errorDir = path.join(__dirname, "../logger/logs");
            const errors = await countFilesInDirectory(errorDir);

            const message =
                `📌 Foydalanuvchilar: <b>${userRows.length} ta</b>\n` +
                `🔢 Animelar: <b>${animeRows.length} ta</b>\n` +
                `🎞 Barcha qismlar: <b>${episodeRows.length} ta</b>\n` +
                `🎙 Dublyaj studiyalari: <b>${dubRows.length} ta</b>\n` +
                `🔢 Xatoliklar: <b>${errors} ta</b>\n` +
                `🤖 Bot: <b>@${process.env.BOT_USERNAME}</b>\n`;
            await bot.telegram.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: "HTML" });

            console.log("✅ scheduler");
        } catch (error: unknown) {
            console.error(error instanceof Error ? error.message : error);
            logError("scheduler", error);
        }
    });
};

const sendUserActivity = (bot: Telegraf): void => {
    if (!ADMIN_CHAT_ID) return;
    schedule.scheduleJob("11 0 * * *", async () => {
        try {
            const date = new Date();
            date.setDate(date.getDate() - 1);
            const yesterday = date.toISOString().slice(0, 10);

            const users = await userDb.select().from(animeBot).where(eq(animeBot.date, yesterday)).orderBy(desc(animeBot.clicked));

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
                    users.map((u) => `✅ ${u.tgUsername ? `@${u.tgUsername}` : `${u.tgUserId}: ${u.tgName}`} <b>⭐️${u.clicked}</b>`).join("\n");
                await bot.telegram.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: "HTML" });
            }

            console.log("✅ user activity scheduler");
        } catch (error: unknown) {
            console.error(error instanceof Error ? error.message : error);
            logError("scheduler", error);
        }
    });

    schedule.scheduleJob("12 0 1 * *", async () => {
        try {
            const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const nodays = new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate();
            const cutoffStr = firstOfMonth.toISOString().slice(0, 10);

            const table = await userDb.select().from(animeBot).where(lt(animeBot.date, cutoffStr));
            const grouped = await userDb
                .select({
                    tgUserId: animeBot.tgUserId,
                    totalClicked: sum(animeBot.clicked),
                })
                .from(animeBot)
                .where(lt(animeBot.date, cutoffStr))
                .groupBy(animeBot.tgUserId);
            const users = grouped.map((row) => ({
                tg_user_id: row.tgUserId,
                total_clicked: Number(row.totalClicked) || 0,
            }));
            const total_clicked = users.reduce((s, u) => s + u.total_clicked, 0);
            users.sort((a, b) => b.total_clicked - a.total_clicked);

            const infoByUser = new Map<number, (typeof table)[0]>();
            for (const row of table) {
                if (!infoByUser.has(row.tgUserId)) infoByUser.set(row.tgUserId, row);
            }

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
                    `👇 Eng faollar: <b>${Math.min(10, users.length)} ta</b>\n` +
                    users
                        .slice(0, 10)
                        .map((u) => {
                            const info = infoByUser.get(u.tg_user_id);
                            const label = info?.tgUsername ? `@${info.tgUsername}` : `${u.tg_user_id}: ${info?.tgName ?? ""}`;
                            return `✅ ${label} <b>⭐️${u.total_clicked}</b>`;
                        })
                        .join("\n");

                await bot.telegram.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: "HTML" });
            }

            await userDb.delete(animeBot).where(lt(animeBot.date, cutoffStr));
            console.log("✅ user activity scheduler");
        } catch (error: unknown) {
            console.error(error instanceof Error ? error.message : error);
            logError("scheduler", error);
        }
    });
};

export { sendDataToAdmin, sendUserActivity };
