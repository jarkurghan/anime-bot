import type { Context } from "grammy";
import type { UserStatus } from "@/utils/types.ts";

import { sendLog } from "@/services/log.ts";
import { userLink } from "@/services/save-user.ts";
import { sendErrorLog } from "@/services/log.ts";
import { sendAdmin } from "@/services/log.ts";
import { abu } from "@/db/schema.ts";
import { db } from "@/db/client.ts";
import { eq } from "drizzle-orm";

export async function changeStatus(ctx: Context, status: UserStatus) {
    const tg_id = ctx.from?.id;
    if (!tg_id) return;

    const user = { tg_id, first_name: ctx.from?.first_name || "", last_name: ctx.from?.last_name || "", username: ctx.from?.username || "" };
    const userlink = userLink(user);

    try {
        const whereCondition = eq(abu.tg_id, String(tg_id));
        const [updated] = await db.update(abu).set({ status }).where(whereCondition).returning();

        if (!updated) {
            const msg =
                `❗️ <b>Xato:</b>\n\n` +
                `🔦 Tafsilot: Status o'zgartirilmadi (foydalanuvchi topilmadi)\n` +
                `🆔 User ID: <code>${tg_id}</code>\n` +
                `👤 User: ${userlink}`;
            await sendLog(msg);
        } else {
            const msg =
                `♻️ Status o'zgartirildi:\n\n` +
                `👤 Ism: ${userlink}\n` +
                `🆔 User ID: <code>${tg_id}</code>\n` +
                `♻️ Yangi status: ${status}\n` +
                `🤖 Bot: @aniuz_bot`;
            await sendAdmin(msg);
        }
    } catch (error) {
        await sendErrorLog({ ctx, event: "Status o'zgartirishda", error });
    }
}
