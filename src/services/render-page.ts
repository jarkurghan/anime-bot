import { db } from "@/db/client.ts";
import { anime, episode } from "@/db/schema.ts";
import { eq, or, ilike, asc, sql } from "drizzle-orm";
import { PAGE_SIZE } from "@/utils/constants.ts";
import { cb } from "@/services/keyboards.ts";

type CallbackButton = ReturnType<typeof cb>;
type ButtonRow = CallbackButton[];

const renderAnimePage = async (page = 0, search = "") => {
    let animeList;
    if (search) {
        const searchQuery = or(ilike(anime.name, `%${search}%`), ilike(anime.keys, `%${search}%`));
        animeList = await db.select().from(anime).where(searchQuery);
    } else {
        animeList = await db.select().from(anime);
    }

    const totalPages = Math.ceil(animeList.length / PAGE_SIZE);

    const getPage = (p: number) => {
        const start = p * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return animeList.slice(start, end);
    };

    const currentPage = getPage(page);
    const listMaker = (a: (typeof animeList)[0], index: number) => `<i>${index + 1 + page * PAGE_SIZE}. ${a.name}</i>`;
    const textList =
        `<b>Animelar ro'yxati: ${page * PAGE_SIZE + 1}-${page * PAGE_SIZE + currentPage.length}</b>\n\n` +
        currentPage.map(listMaker).join("\n") +
        "\n\n<blockquote>Bot yangiliklaridan xabardor bo'lish uchun @ikki_moviy_girdob kanaliga a'zo bo'ling!</blockquote>";

    const buttons: ButtonRow[] = [];
    currentPage.forEach((a, index) => {
        const button = cb(`${index + 1 + page * PAGE_SIZE}`, `anime_${a.id}`);
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
    else return { textList, buttons };
};

const renderEpisodePage = async (animeId: number, page: number) => {
    const [animeRow] = await db.select({ id: anime.id, name: anime.name }).from(anime).where(eq(anime.id, animeId)).limit(1);
    if (!animeRow?.name) return { textList: "<b>Topilmadi!</b>", buttons: [] as ButtonRow[] };

    const selection = { id: episode.id, name: episode.name, episode: episode.episode };
    const episodeQuery = sql`anime_id = ${animeId} AND id IN (SELECT MIN(id) FROM episode WHERE anime_id = ${animeId} GROUP BY episode)`;
    const episodeList = await db.select(selection).from(episode).where(episodeQuery).orderBy(asc(episode.id));

    const totalPages = Math.ceil(episodeList.length / PAGE_SIZE);

    const getPage = (p: number) => {
        const start = p * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return episodeList.slice(start, end);
    };

    const currentPage = getPage(page);
    if (currentPage.length === 0) return { textList: "<b>Qismlar topilmadi!</b>", buttons: [] as ButtonRow[] };

    const textList =
        `<b>${animeRow.name}: ${page * PAGE_SIZE + 1}-${page * PAGE_SIZE + currentPage.length}</b> \nUmumiy ${episodeList.length} qism\n\n` +
        currentPage.map((ep, i) => `<i>${page * PAGE_SIZE + 1 + i}. <b>${ep.episode}</b>. ${ep.name}</i>`).join("\n") +
        "\n\n<blockquote>Bot yangiliklaridan xabardor bo'lish uchun @ikki_moviy_girdob kanaliga a'zo bo'ling!</blockquote>";

    const buttons: ButtonRow[] = [];
    currentPage.forEach((ep, index) => {
        const button = cb(`${index + 1 + page * PAGE_SIZE}`, `episode_${ep.id}`);
        const rowIndex = Math.floor(index / 5);
        if (!buttons[rowIndex]) buttons[rowIndex] = [];
        buttons[rowIndex]!.push(button);
    });

    const text = `${page * PAGE_SIZE + 1}-${page * PAGE_SIZE + currentPage.length}` + "   barchasini tanlash";
    const query = "all_episode_" + currentPage[0]!.id + "_" + currentPage[currentPage.length - 1]!.id;
    buttons.push([cb(text, query)]);

    const navigationButtons: CallbackButton[] = [];
    if (page > 0) navigationButtons.push(cb("⬅️ Oldingi", `elist_${animeId}_${page - 1}`));
    if (page < totalPages - 1) navigationButtons.push(cb("Keyingi ➡️", `elist_${animeId}_${page + 1}`));
    if (navigationButtons.length > 0) buttons.push(navigationButtons);

    buttons.push([cb("📂 Animelar ro'yxati", "back_anime_list")]);

    return { textList, buttons };
};

export { renderAnimePage, renderEpisodePage };
