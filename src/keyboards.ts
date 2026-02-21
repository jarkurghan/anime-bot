import { InlineKeyboard } from "grammy";

/** Telegraf `Markup.button.callback` bilan bir xil shakl */
export function cb(text: string, callback_data: string): { text: string; callback_data: string } {
    return { text, callback_data };
}

export function urlBtn(text: string, url: string): { text: string; url: string } {
    return { text, url };
}

/** Qatorlar: faqat `callback_data` yoki aralash `url` */
export function rowsToInlineKeyboard(
    rows: ({ text: string; callback_data: string } | { text: string; url: string })[][]
): InlineKeyboard {
    const kb = new InlineKeyboard();
    for (const row of rows) {
        for (const btn of row) {
            if ("url" in btn) kb.url(btn.text, btn.url);
            else kb.text(btn.text, btn.callback_data);
        }
        kb.row();
    }
    return kb;
}
