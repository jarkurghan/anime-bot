import type { Context } from "telegraf";

const requiredChannels = [{ username: process.env.MY_CHANNEL_USERNAME, name: process.env.MY_CHANNEL_NAME }];

async function checkSubscription(_ctx: Context): Promise<typeof requiredChannels> {
    const notSubscribed: typeof requiredChannels = [];

    return notSubscribed;
}

export { checkSubscription };
