const db = require("../db/db");

async function info(ctx) {
    const userId = ctx.from.id;
    const user = await db("user").where({ user_id: userId }).first();

    const dublajlar = await db("episodes").select("dublyaj", "qism").where({ season: user.season }).orderBy("qism", "asc");
    const groupedDublajlar = dublajlar.reduce((acc, item) => {
        if (!acc[item.dublyaj]) {
            acc[item.dublyaj] = [];
        }
        acc[item.dublyaj].push(item.qism);
        return acc;
    }, {});

    let message = "🎭 Dublaj studiyalari va tarjima qilingan qismlar:\n\n";
    const sortedDublajlar = Object.entries(groupedDublajlar).sort((a, b) => Math.min(...a[1]) - Math.min(...b[1]));

    for (const [dublyaj, qismlar] of sortedDublajlar) {
        const sortedQismlar = qismlar.sort((a, b) => a - b);
        message += `🎙 <b>${dublyaj}</b>: ${sortedQismlar.join(", ")}\n`;
    }

    ctx.replyWithHTML(message);
}

module.exports = { info };