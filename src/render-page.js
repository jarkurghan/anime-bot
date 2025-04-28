const { Markup } = require("telegraf");
const db = require("../db/db");

const renderAnimePage = async (page = 0) => {
    const pageSize = 10;
    const animeList = await db("anime");
    // .leftJoin("episode", "anime.id", "episode.anime_id")
    // .select("anime.id", "anime.name", "anime.number_of_episode")
    // .count("episode.episode as episode_count")
    // .groupBy("anime.id")
    // .orderBy("anime.id");

    const totalPages = Math.ceil(animeList.length / pageSize);

    const getPage = (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        return animeList.slice(start, end);
    };

    const currentPage = getPage(page);
    // const listMaker = (anime, index) =>
    //     `<i>${index + 1 + page * pageSize}. ${anime.name} - ${anime.number_of_episode == anime.episode_count ? "to'liq" : "tugatilmagan"} - ${
    //         anime.episode_count
    //     } qism</i>`;
    const listMaker = (anime, index) => `<i>${index + 1 + page * pageSize}. ${anime.name}</i>`;
    const textList =
        `<b>Animelar ro'yxati: ${page * pageSize + 1}-${page * pageSize + currentPage.length}</b>\n\n` +
        currentPage.map(listMaker).join("\n") +
        "\n\n<blockquote>Bot yangiliklaridan xabardor bo'lish uchun @ani_uz_news kanaliga a'zo bo'ling!</blockquote>";
    // "\n\nBu yerda sizning reklamangiz bo'lishi mumkin edi!";

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

    if (animeList.length === 0) return { textList: "<b>Anime topilmadi!</b>", buttons };
    return { textList, buttons };
};

const renderEpisodePage = async (animeId, page) => {
    const pageSize = 10;
    const episodeList = await db("episode").select("id", "episode", "name").where("anime_id", animeId).groupBy("episode").orderBy("id");
    const anime = await db("anime").select("id", "name").where("id", animeId).first();

    const totalPages = Math.ceil(episodeList.length / pageSize);

    const getPage = (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        return episodeList.slice(start, end);
    };

    const currentPage = getPage(page);
    const textList =
        `<b>${anime.name}: ${page * pageSize + 1}-${page * pageSize + currentPage.length}</b> \nUmumiy ${episodeList.length} qism\n\n` +
        currentPage.map((episode, i) => `<i>${page * pageSize + 1 + i}. <b>${episode.episode}</b>. ${episode.name}</i>`).join("\n") +
        "\n\n<blockquote>Bot yangiliklaridan xabardor bo'lish uchun @ani_uz_news kanaliga a'zo bo'ling!</blockquote>";
    // "\n\nBu yerda sizning reklamangiz bo'lishi mumkin edi!";

    const buttons = [];
    currentPage.forEach((episode, index) => {
        const button = Markup.button.callback(`${index + 1 + page * pageSize}`, `episode_${episode.id}`);
        const rowIndex = Math.floor(index / 5);
        if (!buttons[rowIndex]) buttons[rowIndex] = [];
        buttons[rowIndex].push(button);
    });

    const text = `${page * pageSize + 1}-${page * pageSize + currentPage.length}` + "   barchasini tanlash";
    const query = "all_episode_" + currentPage[0].id + "_" + currentPage[currentPage.length - 1].id;
    buttons.push([Markup.button.callback(text, query)]);

    const navigationButtons = [];
    if (page > 0) {
        navigationButtons.push(Markup.button.callback("⬅️ Oldingi", `elist_${animeId}_${page - 1}`));
    }
    if (page < totalPages - 1) {
        navigationButtons.push(Markup.button.callback("Keyingi ➡️", `elist_${animeId}_${page + 1}`));
    }
    if (navigationButtons.length > 0) {
        buttons.push(navigationButtons);
    }

    buttons.push([Markup.button.callback("📂 Animelar ro'yxati", "back_anime_list")]);

    return { textList, buttons };
};

module.exports = { renderAnimePage, renderEpisodePage };
