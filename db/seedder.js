const { pool } = require("./client");
const path = require("path");
const fs = require("fs");

/** PostgreSQL jadval nomlari (user — rezerv so'z). */
const TABLES = [
    { file: "user", sql: '"user"' },
    { file: "anime", sql: "anime" },
    { file: "anime_info", sql: "anime_info" },
    { file: "dub", sql: "dub" },
    { file: "episode", sql: "episode" },
    { file: "channel_post", sql: "channel_post" },
    { file: "user_page", sql: "user_page" },
];

async function exportData() {
    try {
        const logsDir = path.join(__dirname, `seeds`);
        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

        for (let i = 0; i < TABLES.length; i++) {
            const { file, sql: tableSql } = TABLES[i];
            try {
                const { rows: data } = await pool.query(`SELECT * FROM ${tableSql}`);
                data.forEach((item) => delete item.id);
                await fs.promises.writeFile(
                    `${logsDir}/${i + 1}_${file}.js`,
                    `/**
 * Standalone seed — Drizzle insert namunasi (jadval: ${file})
 * @param {import("drizzle-orm/node-postgres").NodePgDatabase} db
 */
exports.seed = async function () {
    console.warn("Seed faylni loyihadagi schema bilan qo'lda moslang.");
};`,
                    "utf8"
                );
                await fs.promises.writeFile(`${logsDir}/${i + 1}_${file}.json`, JSON.stringify(data, null, 4), "utf8");
                console.log(file, "tayyor");
            } catch (error) {
                console.error(file, error);
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

exportData();
