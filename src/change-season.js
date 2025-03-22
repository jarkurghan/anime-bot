const { Markup } = require("telegraf");
const db = require("../db/db");

function changeSeason(ctx) {
    ctx.reply(
        "📂 Qaysi mavsumni tanlaysiz?",
        Markup.inlineKeyboard([
            [Markup.button.callback("Naruto", "season_naruto")],
            [Markup.button.callback("Naruto Shippuden", "season_shippuden")],
            [Markup.button.callback("Boruto: Naruto Next Generations", "season_boruto")],
            [Markup.button.callback("Boruto: Two Blue Vortex", "season_vortex")],
        ])
    );
}

async function changeSeasonAction(ctx) {
    const sn = ctx.match[1];
    const season = sn === "naruto" ? 1 : sn === "shippuden" ? 2 : sn === "boruto" ? 3 : sn === "vortex" ? 4 : 0;
    const message =
        season === 1
            ? "Naruto animesi tanlandi."
            : season === 2
            ? "Naruto Shippuden animesi tanlandi."
            : season === 3
            ? "Boruto: Naruto Next Generations animesi tanlandi."
            : season === 4
            ? "Boruto: Two Blue Vortex animesi tanlandi."
            : "Noma'lum mavsum tanlandi.";

    if (season !== 0) {
        const user_id = ctx.from.id;
        await db("user").where({ user_id }).update({ season });
    }
    ctx.deleteMessage();
    ctx.reply(message);
}

exports.changeSeason = changeSeason;
exports.changeSeasonAction = changeSeasonAction;
