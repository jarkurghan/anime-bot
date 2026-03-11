import type { Context, Filter } from "grammy";
import { changeStatus } from "@/services/deactivator.ts";
import { sendErrorLog } from "@/services/log.ts";

export async function registerChatMember(ctx: Filter<Context, "my_chat_member">) {
    try {
        if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
            return await ctx.reply("Bu bot faqat shaxsiy chatda ishlaydi!", { parse_mode: "HTML" });
        } else if (ctx.chat.type !== "private") return;

        const tgId = ctx.from?.id;
        if (!tgId) return;

        if (ctx.myChatMember.new_chat_member.status === "kicked") {
            await changeStatus(ctx, "has_blocked");
        } else if (ctx.myChatMember.new_chat_member.status === "member") {
            await changeStatus(ctx, "active");
        }
    } catch (error) {
        await sendErrorLog({ ctx, event: "register_chat_member", error });
    }
}
