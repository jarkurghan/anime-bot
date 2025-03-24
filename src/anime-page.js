const { Markup } = require("telegraf");
const db = require("../db/db");

const renderAnimePage = async (page = 0) => {
    const pageSize = 10;
    const animeList = await db("anime")
        .select("anime.id", "anime.name")
        .count("episode.id as episode_count")
        .leftJoin("episode", "anime.id", "episode.anime_id")
        .groupBy("anime.id")
        .orderBy("anime.id");

    const totalPages = Math.ceil(animeList.length / pageSize);

    const getPage = (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        return animeList.slice(start, end);
    };

    const currentPage = getPage(page);
    const textList =
        `<b>Animelar ro'yxati: ${page * pageSize + 1}-${page * pageSize + currentPage.length}</b> \numumiy ${animeList.length}ta\n\n` +
        currentPage.map((anime, index) => `<i>${index + 1 + page * pageSize}. ${anime.name} - tugatilgan - ${anime.episode_count} qism</i>`).join("\n") +
        "\n\nBu yerda sizning reklamangiz bo'lishi mumkin edi!";

    const buttons = [];
    currentPage.forEach((anime, index) => {
        const button = Markup.button.callback(`${index + 1 + page * pageSize}`, `anime_${anime.id}`);
        const rowIndex = Math.floor(index / 5);
        if (!buttons[rowIndex]) buttons[rowIndex] = [];
        buttons[rowIndex].push(button);
    });

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
    const { textList, buttons } = await renderAnimePage(page);
    const keyboard = Markup.inlineKeyboard(buttons);
    await ctx.editMessageText(textList, { parse_mode: "HTML", ...keyboard });
};

const renderEpisodePage = async (animeId, page = 0) => {
    const pageSize = 10;
    const episodeList = await db("episode").select("id", "qism", "nom").distinct("qism");

    const totalPages = Math.ceil(episodeList.length / pageSize);

    const getPage = (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        return episodeList.slice(start, end);
    };

    const currentPage = getPage(page);
    const textList2 =
        `<b>Animelar ro'yxati: ${page * pageSize + 1}-${page * pageSize + currentPage.length}</b> \numumiy ${animeList.length}ta\n\n` +
        currentPage.map((anime, index) => `<i>${index + 1 + page * pageSize}. ${anime.name} - tugatilgan - ${anime.episode_count} qism</i>`).join("\n") +
        "\n\nBu yerda sizning reklamangiz bo'lishi mumkin edi!";
    const textList =
        currentPage.map((episode, index) => `${index + 1 + page * pageSize}. ${episode.qism} - ${episode.nom} (${episode.dublyaj})`).join("\n") +
        "\n\nBu yerda sizning reklamangiz bo'lishi mumkin edi!";

    const buttons = [];
    currentPage.forEach((episode, index) => {
        const button = Markup.button.callback(`${index + 1 + page * pageSize}`, `watch_${episode.id}_${animeId}`);
        const rowIndex = Math.floor(index / 5);
        if (!buttons[rowIndex]) buttons[rowIndex] = [];
        buttons[rowIndex].push(button);
    });

    const navigationButtons = [];
    if (page > 0) {
        navigationButtons.push(Markup.button.callback("⬅️ Oldingi", `episode_list_${animeId}_${page - 1}`));
    }
    if (page < totalPages - 1) {
        navigationButtons.push(Markup.button.callback("Keyingi ➡️", `episode_list_${animeId}_${page + 1}`));
    }
    if (navigationButtons.length > 0) {
        buttons.push(navigationButtons);
    }

    return { textList, buttons };
};

const selectPage = async (ctx) => {
    const anime_id = parseInt(ctx.match[1]);
    const { textList, buttons } = await renderEpisodePage(anime_id, 0);
    const keyboard = Markup.inlineKeyboard(buttons);
    await ctx.reply(textList, { parse_mode: "HTML", ...keyboard });
    ctx.deleteMessage();
};

const selectEpisode = async (ctx) => {
    const anime_id = parseInt(ctx.match[1]);
    const { textList, buttons } = await renderEpisodePage(anime_id, 0);
    const keyboard = Markup.inlineKeyboard(buttons);
    await ctx.editMessageText(textList, { parse_mode: "HTML", ...keyboard });
    ctx.deleteMessage();
};

module.exports = { renderAnimePage, changePage, selectPage, selectEpisode };
