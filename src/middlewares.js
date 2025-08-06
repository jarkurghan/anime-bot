const user_db = require("../db/user-db");
const { logError } = require("../logger");

async function createUserDB(data) {
    try {
        const { date, tg_name, tg_user_id, tg_username } = data;

        const existingUser = await user_db("anime_bot").where({ date, tg_user_id }).first();
        if (!existingUser) {
            await user_db("anime_bot").insert({ date, tg_name, tg_user_id, tg_username });
        } else {
            await user_db("anime_bot")
                .where({ date, tg_user_id })
                .update({ clicked: existingUser.clicked + 1 });
        }
    } catch (error) {
        console.error(error.message);
        logError("middleware_user_activity", error);
    }
}

async function userActivity(ctx, next) {
    try {
        const isoDate = new Date().toISOString().slice(0, 10);
        const { id: tg_user_id, username: tg_username, first_name, last_name } = ctx.from;
        const tg_name = `${first_name || "Noma'lum"} ${last_name || ""}`;

        createUserDB({ date: isoDate, tg_name, tg_user_id, tg_username });
    } catch (error) {
        console.log(error);
    }
    return next();
}

module.exports = { userActivity };
