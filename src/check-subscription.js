const { logError } = require("../logger");
const requiredChannels = [{ username: process.env.MY_CHANNEL_USERNAME, name: process.env.MY_CHANNEL_NAME }];

async function checkSubscription(ctx) {
    const userId = ctx.from.id;
    const notSubscribed = [];

    // for (const channel of requiredChannels) {
    //     try {
    //         const chatMember = await ctx.telegram.getChatMember(channel.username, userId);
    //         if (chatMember.status === "left" || chatMember.status === "kicked") {
    //             notSubscribed.push(channel);
    //         }
    //     } catch (error) {
    //         console.error(error.message);
    //         logError("subscribe", error);
    //         ctx.reply("❌ Xatolik yuz berdi. Iltimos, dasturchiga xabar bering.");
    //     }
    // }

    return notSubscribed;
}

module.exports = { checkSubscription };
