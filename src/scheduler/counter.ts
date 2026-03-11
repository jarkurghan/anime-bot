import { db, pool } from "@/db/client.ts";
import { abu, episode } from "@/db/schema.ts";
import { formatLogError } from "@/services/log.ts";
import { sendLog } from "@/services/log.ts";

const resetTodayCounters = async () => {
    await db.update(abu).set({ today_count: 0 });
    await db.update(episode).set({ today_count: 0 });
};

async function main() {
    try {
        await resetTodayCounters();
        await pool.end();
    } catch (err) {
        await sendLog(`<b>scheduler/counter</b>\n<pre>${formatLogError(err)}</pre>`, { parse_mode: "HTML" });
        try {
            await pool.end();
        } catch (err) {
            console.log(err);
        }
        process.exit(1);
    }
}

void main();
