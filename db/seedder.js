const knex = require("./db");
const path = require("path");
const fs = require("fs");

async function exportData() {
    try {
        const logsDir = path.join(__dirname, `seeds`);
        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

        const tables = ["user", "anime", "anime_info", "dub", "episode", "channel_post", "user_page"];
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            try {
                const data = await knex(table).select("*");
                data.map((item) => delete item.id);
                await fs.promises.writeFile(
                    `${logsDir}/${i + 1}_${table}.js`,
                    `/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.seed = async function (knex) {
    try {
        const data = ${JSON.stringify(data, null, 4)};
        await knex("${table}").insert(data);
    } catch (error) {
        console.error(error);
    }
};`,
                    "utf8"
                );
                console.log(table, "tayyor");
            } catch (error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        await knex.destroy();
    }
}

exportData();
