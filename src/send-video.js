const { Markup } = require("telegraf");
const db = require("../db/db");

const CHANNEL_ID = process.env.CHANNEL_ID;

async function sendVideo(ctx) {
    const qism = Number(ctx.message.text);
    if (isNaN(qism)) return ctx.reply("❌ Iltimos, faqat raqam kiriting!");

    const userId = ctx.from.id;
    const user = await db("user").where({ user_id: userId }).first();
    if (!user) return ctx.reply("❌ Foydalanuvchi ma'lumotlari topilmadi. Iltimos, qaytadan /start buyrug'ini bosing.");

    const dublyajlar = await db("episodes").where({ qism, season: user.season });
    if (dublyajlar.length === 0) return ctx.reply("❌ Bunday qism mavjud emas!");

    if (dublyajlar.length === 1) {
        const kino = dublyajlar[0];
        ctx.telegram.copyMessage(ctx.chat.id, CHANNEL_ID, kino.post_id).catch((err) => {
            console.log(err);
            ctx.reply("❌ Bu qism topilmadi!");
        });
    } else {
        ctx.reply(
            `🎬 ${qism}-qism uchun dublajlar:`,
            Markup.inlineKeyboard(dublyajlar.map((item) => [Markup.button.callback(`🎭 ${item.dublyaj}`, `watch_${qism}_${item.dublyaj}`)]))
        );
    }
}
exports.sendVideo = sendVideo;
