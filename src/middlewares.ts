import type { Context, Middleware } from "grammy";
import { userDb } from "../db/user-client.js";
import { animeBot } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { logError } from "../logger/index.js";

async function createUserDB(data: { date: string; tg_name: string; tg_user_id: number; tg_username?: string }): Promise<void> {
    try {
        const { date, tg_name, tg_user_id, tg_username } = data;

        const [existingUser] = await userDb
            .select()
            .from(animeBot)
            .where(and(eq(animeBot.date, date), eq(animeBot.tgUserId, tg_user_id)))
            .limit(1);
        if (!existingUser) {
            await userDb.insert(animeBot).values({ date, tgName: tg_name, tgUserId: tg_user_id, tgUsername: tg_username });
        } else {
            await userDb
                .update(animeBot)
                .set({ clicked: (existingUser.clicked ?? 0) + 1 })
                .where(and(eq(animeBot.date, date), eq(animeBot.tgUserId, tg_user_id)));
        }
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        logError("middleware_user_activity", error);
    }
}

export const userActivity: Middleware<Context> = async (ctx, next) => {
    try {
        const isoDate = new Date().toISOString().slice(0, 10);
        const from = ctx.from;
        if (!from) return next();
        const { id: tg_user_id, username: tg_username, first_name, last_name } = from;
        const tg_name = `${first_name ?? "Noma'lum"} ${last_name ?? ""}`;

        void createUserDB({ date: isoDate, tg_name, tg_user_id, tg_username });
    } catch (error) {
        console.log(error);
    }
    return next();
};
