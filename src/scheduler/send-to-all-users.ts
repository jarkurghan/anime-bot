import { eq } from "drizzle-orm";
import { bot } from "../bot.ts";
import { db, pool } from "../db/client.ts";
import { abu } from "../db/schema.ts";
import { sendLog } from "../services/log.ts";
import { sendAdmin } from "../services/log.ts";
import { sendErrorLog } from "../services/log.ts";
import { userLink } from "../services/save-user.ts";
import { User, UserStatus } from "../utils/types.ts";
import { GrammyError } from "grammy";

async function changeStatus(user: User, status: UserStatus) {
    const tg_id = user.tg_id;
    if (!tg_id) return;

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
        await sendErrorLog({ event: "Status o'zgartirishda", error });
    }
}

const sendToAllUsers = async (): Promise<void> => {
    const users = await db.select().from(abu);

    let sent = 0;
    let failed = 0;

    for (const user of users) {
        if (user.status === "has_blocked" || user.status === "deleted_account") continue;
        try {
            const message =
                "Assalomu alaykum! 👋\n\n" +
                "Sizni multfilm botimizga taklif qilamiz. Botda 300dan koʻproq multfilm bor va har kuni qoʻshib boryapmiz.\n\n" +
                `<a href="https://t.me/uz_multfilm_bot?start=utm-aniuzbot">@uz_multfilm_bot</a> shunchaki sinab koʻring 😉`;
            await bot.api.sendMessage(user.tg_id, message, { parse_mode: "HTML", link_preview_options: { is_disabled: true } });
            sent++;
        } catch (error) {
            failed++;

            const userData: User = {
                tg_id: user.tg_id,
                first_name: user.first_name ?? "",
                last_name: user.last_name,
                username: user.username,
            };

            if (error instanceof GrammyError) {
                const description = error.description || "";

                if (description.includes("bot was blocked by the user")) {
                    await sendLog(`Foydalanuvchi botni bloklagan (${userLink(userData)}): \n${description}`);
                    await changeStatus(userData, "has_blocked");
                } else if (description.includes("user is deactivated")) {
                    await sendLog(`O'chirilgan hisob (${userLink(userData)}): \n${description}`);
                    await changeStatus(userData, "deleted_account");
                } else {
                    await sendLog(`Xabar yuborishda xatolik (${userLink(userData)}): \n${description}`);
                    await changeStatus(userData, "other");
                }
            } else if (error instanceof Error) {
                await sendLog(`Xabar yuborishda xatolik (${userLink(userData)}): \n${error.message}`);
            } else {
                await sendLog(`Xabar yuborishda xatolik (${userLink(userData)}): \n${String(error)}`);
            }
        }
    }

    const summary = `✅ Reply keyboard yangiligi yuborildi\n\n🎯 Yuborildi: ${sent}\n💣 Xato: ${failed}\n🏆 Jami: ${sent + failed}`;
    console.log(summary);
    await sendLog(summary);
};

async function main() {
    try {
        await sendToAllUsers();
        await pool.end();
    } catch (err) {
        console.error(err);
        try {
            await pool.end();
        } finally {
            process.exit(1);
        }
    }
}

main();
