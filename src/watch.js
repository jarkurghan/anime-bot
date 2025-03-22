const db = require("../db/db");

exports.watch = async function watch(ctx) {
    const qism = Number(ctx.match[1]);
    const dublyaj = ctx.match[2];

    try {
        const userId = ctx.from.id;
        const user = await db("user").where({ user_id: userId }).first();

        if (!user) {
            return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, /start buyrug'ini bosing.");
        }

        const kino = await db("episodes").where({ qism, dublyaj, season: user.season }).first();

        if (kino) {
            ctx.telegram.copyMessage(ctx.chat.id, process.env.CHANNEL_ID, kino.post_id).catch(() => {
                ctx.reply("❌ Bu qism topilmadi!");
            });
        } else {
            ctx.reply("❌ Bu qism ushbu mavsumda mavjud emas!");
        }
    } catch (err) {
        console.error("❌ Xatolik yuz berdi:", err);
        ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.");
    }
};
