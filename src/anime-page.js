const { Markup } = require("telegraf");
const db = require("../db/db");

const renderPage = async (page = 0) => {
    // Get anime list from the database
    const pageSize = 10; // Number of items per page
    const animeList = await db("anime").select("id", "name").orderBy("id");

    const totalPages = Math.ceil(animeList.length / pageSize);

    const getPage = (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        return animeList.slice(start, end);
    };

    const currentPage = getPage(page);
    const textList = currentPage.map((anime, index) => `${index + 1 + page * pageSize}. ${anime.name}`).join("\n");

    // Create buttons with 5 per row
    const buttons = [];
    currentPage.forEach((anime, index) => {
        const button = Markup.button.callback(`${index + 1 + page * pageSize}`, `anime_${anime.id}`);
        const rowIndex = Math.floor(index / 5); // Group buttons into rows of 5
        if (!buttons[rowIndex]) {
            buttons[rowIndex] = [];
        }
        buttons[rowIndex].push(button);
    });

    // Add navigation buttons (⬅️ Oldingi / Keyingi ➡️)
    const navigationButtons = [];
    if (page > 0) {
        navigationButtons.push(Markup.button.callback("⬅️ Oldingi", `anime_list_${page - 1}`));
    }
    if (page < totalPages - 1) {
        navigationButtons.push(Markup.button.callback("Keyingi ➡️", `anime_list_${page + 1}`));
    }
    if (navigationButtons.length > 0) {
        buttons.push(navigationButtons);
    }

    return { textList, buttons };
};

const changePage = async (ctx) => {
    const page = parseInt(ctx.match[1]);
    const { textList, buttons } = await renderPage(page);
    const keyboard = Markup.inlineKeyboard(buttons);
    await ctx.editMessageText(textList, { parse_mode: "HTML", ...keyboard });
};

module.exports = { renderPage, changePage };
