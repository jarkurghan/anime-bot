const { actions } = require("..");

exports.sendToAll = async function sendToAll(ctx) {
    try {
        actions.sendToAll.flag = true;
        actions.sendToAll.time = new Date();
        ctx.reply("✅ oyna ochildi!");
    } catch (err) {
        console.error("❌ Xabar yuborishda xatolik:", err);
        ctx.reply("❌ Xabar yuborishda xatolik yuz berdi.");
    }
};
