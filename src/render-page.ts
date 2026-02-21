import { db } from "@/db/client.js";
import { anime, episode } from "@/db/schema.js";
import { eq, or, ilike, asc, sql } from "drizzle-orm";
import { cb } from "@/src/keyboards.js";

type CallbackButton = ReturnType<typeof cb>;
type ButtonRow = CallbackButton[];

const renderAnimePage = async (page = 0, search = "") => {
    const pageSize = 10;
    let animeList;
    if (search) {
        animeList = await db
            .select()
            .from(anime)
            .where(or(ilike(anime.name, `%${search}%`), ilike(anime.keys, `%${search}%`)));
    } else {
        animeList = await db.select().from(anime);
    }

    const totalPages = Math.ceil(animeList.length / pageSize);

    const getPage = (p: number) => {
        const start = p * pageSize;
        const end = start + pageSize;
        return animeList.slice(start, end);
    };

    const currentPage = getPage(page);
    const listMaker = (a: (typeof animeList)[0], index: number) => `<i>${index + 1 + page * pageSize}. ${a.name}</i>`;
    const textList =
        `<b>Animelar ro'yxati: ${page * pageSize + 1}-${page * pageSize + currentPage.length}</b>\n\n` +
        currentPage.map(listMaker).join("\n") +
        "\n\n<blockquote>Bot yangiliklaridan xabardor bo'lish uchun @ani_uz_news kanaliga a'zo bo'ling!</blockquote>";

    const buttons: ButtonRow[] = [];
    currentPage.forEach((a, index) => {
        const button = cb(`${index + 1 + page * pageSize}`, `anime_${a.id}`);
        const rowIndex = Math.floor(index / 5);
        if (!buttons[rowIndex]) buttons[rowIndex] = [];
        buttons[rowIndex]!.push(button);
    });

    const navigationButtons: CallbackButton[] = [];
    if (page > 0) navigationButtons.push(cb("⬅️ Oldingi", `anime_list_${page - 1}`));
    if (search) navigationButtons.push(cb("❌", "remove_searching"));
    if (page < totalPages - 1) navigationButtons.push(cb("Keyingi ➡️", `anime_list_${page + 1}`));
    if (navigationButtons.length > 0) buttons.push(navigationButtons);

    if (animeList.length === 0) return { textList: "<b>Anime topilmadi!</b>", buttons };
    return { textList, buttons };
};

const renderEpisodePage = async (animeId: number, page: number) => {
    const pageSize = 10;
    const [animeRow] = await db.select({ id: anime.id, name: anime.name }).from(anime).where(eq(anime.id, animeId)).limit(1);
    if (!animeRow?.name) {
        return { textList: "<b>Topilmadi!</b>", buttons: [] as ButtonRow[] };
    }

    const episodeList = await db
        .select({
            id: episode.id,
            name: episode.name,
            episode: episode.episode,
        })
        .from(episode)
        .where(sql`anime_id = ${animeId} AND id IN (SELECT MIN(id) FROM episode WHERE anime_id = ${animeId} GROUP BY episode)`)
        .orderBy(asc(episode.id));

    const totalPages = Math.ceil(episodeList.length / pageSize);

    const getPage = (p: number) => {
        const start = p * pageSize;
        const end = start + pageSize;
        return episodeList.slice(start, end);
    };

    const currentPage = getPage(page);
    if (currentPage.length === 0) {
        return { textList: "<b>Qismlar topilmadi!</b>", buttons: [] as ButtonRow[] };
    }

    const textList =
        `<b>${animeRow.name}: ${page * pageSize + 1}-${page * pageSize + currentPage.length}</b> \nUmumiy ${episodeList.length} qism\n\n` +
        currentPage.map((ep, i) => `<i>${page * pageSize + 1 + i}. <b>${ep.episode}</b>. ${ep.name}</i>`).join("\n") +
        "\n\n<blockquote>Bot yangiliklaridan xabardor bo'lish uchun @ani_uz_news kanaliga a'zo bo'ling!</blockquote>";

    const buttons: ButtonRow[] = [];
    currentPage.forEach((ep, index) => {
        const button = cb(`${index + 1 + page * pageSize}`, `episode_${ep.id}`);
        const rowIndex = Math.floor(index / 5);
        if (!buttons[rowIndex]) buttons[rowIndex] = [];
        buttons[rowIndex]!.push(button);
    });

    const text = `${page * pageSize + 1}-${page * pageSize + currentPage.length}` + "   barchasini tanlash";
    const query = "all_episode_" + currentPage[0]!.id + "_" + currentPage[currentPage.length - 1]!.id;
    buttons.push([cb(text, query)]);

    const navigationButtons: CallbackButton[] = [];
    if (page > 0) {
        navigationButtons.push(cb("⬅️ Oldingi", `elist_${animeId}_${page - 1}`));
    }
    if (page < totalPages - 1) {
        navigationButtons.push(cb("Keyingi ➡️", `elist_${animeId}_${page + 1}`));
    }
    if (navigationButtons.length > 0) {
        buttons.push(navigationButtons);
    }

    buttons.push([cb("📂 Animelar ro'yxati", "back_anime_list")]);

    return { textList, buttons };
};

export { renderAnimePage, renderEpisodePage };
