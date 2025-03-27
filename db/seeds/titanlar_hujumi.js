const db = require("../db");

const data = [
    { episode: "1-fasl 1-qism", name: "Shiganshina qulashi. 2000 yildan so'ng senga", dub: "Max film", posts: [{ post_id: 316 }] },
    { episode: "1-fasl 2-qism", name: "Shiganshina qulashi. O'sha kun", dub: "Max film", posts: [{ post_id: 317 }] },
    { episode: "1-fasl 3-qism", name: "Odamzodning tiklanishi. Umidsizlik orasidagi nur", dub: "Max film", posts: [{ post_id: 318 }] },
    { episode: "1-fasl 4-qism", name: "Odamzodning tiklanishi. Bitiruv kechasi", dub: "Max film", posts: [{ post_id: 319 }] },
    { episode: "1-fasl 5-qism", name: "Trost uchun jang", dub: "Max film", posts: [{ post_id: 320 }] },
    { episode: "1-fasl 6-qism", name: "Trost uchun jang. Qizning nazaridagi dunyo", dub: "Max film", posts: [{ post_id: 321 }] },
    { episode: "1-fasl 7-qism", name: "Trost uchun jang. Kichik qilich", dub: "Max film", posts: [{ post_id: 322 }] },
    { episode: "1-fasl 8-qism", name: "Trost uchun jang. Yurak urishini eshityapman", dub: "Max film", posts: [{ post_id: 323 }] },
    { episode: "1-fasl 9-qism", name: "Trost uchun jang. Chap qo'l qayerda", dub: "Max film", posts: [{ post_id: 324 }] },
    { episode: "1-fasl 10-qism", name: "Trost uchun jang. Javob", dub: "Max film", posts: [{ post_id: 325 }] },
    { episode: "1-fasl 11-qism", name: "Trost uchun jang. Mujda", dub: "Max film", posts: [{ post_id: 326 }] },
    { episode: "1-fasl 12-qism", name: "Trost uchun jang. Yara", dub: "Max film", posts: [{ post_id: 327 }] },
    { episode: "1-fasl 13-qism", name: "Trost uchun jang. Asl tilak", dub: "Max film", posts: [{ post_id: 328 }] },
    { episode: "1-fasl 14-qism", name: "Qarshi hujum arafasida. Uning ko'ziga qaray olmayman", dub: "Max film", posts: [{ post_id: 329 }] },
    { episode: "1-fasl 15-qism", name: "Qarshi hujum arafasida. Maxsus guruh", dub: "Max film", posts: [{ post_id: 330 }] },
    { episode: "1-fasl 16-qism", name: "Qarshi hujum arafasida. Hozir nima qilishim kerak", dub: "Max film", posts: [{ post_id: 331 }] },
    { episode: "1-fasl 17-qism", name: "57-ekspeditsiya. Ayol zotli titan", dub: "Max film", posts: [{ post_id: 332 }] },
    { episode: "1-fasl 18-qism", name: "57-ekspeditsiya. Ulkan daraxtlar o'rmoni", dub: "Max film", posts: [{ post_id: 333 }] },
    { episode: "1-fasl 19-qism", name: "57-ekspeditsiya. Hamla", dub: "Max film", posts: [{ post_id: 334 }] },
    { episode: "1-fasl 20-qism", name: "57-ekspeditsiya. Ervin Smit", dub: "Max film", posts: [{ post_id: 335 }] },
    { episode: "1-fasl 21-qism", name: "57-ekspeditsiya. Qaqshatqich zarba", dub: "Max film", posts: [{ post_id: 336 }] },
    { episode: "1-fasl 22-qism", name: "57-ekspeditsiya. Yengilganlar", dub: "Max film", posts: [{ post_id: 337 }] },
    { episode: "1-fasl 23-qism", name: "Stohes hududiga hujum. Tabassum", dub: "Max film", posts: [{ post_id: 338 }] },
    { episode: "1-fasl 24-qism", name: "Stohes hududiga hujum. Muruvvat", dub: "Max film", posts: [{ post_id: 339 }] },
    { episode: "1-fasl 25-qism", name: "Stohes hududiga hujum. Devor", dub: "Max film", posts: [{ post_id: 340 }] },
    { episode: "2-fasl 1-qism", name: "Hayvonsimon titan", dub: "Max film", posts: [{ post_id: 341 }] },
    { episode: "2-fasl 2-qism", name: "Men uydaman", dub: "Max film", posts: [{ post_id: 342 }] },
    { episode: "2-fasl 3-qism", name: "Janubi g'arbiy tomon", dub: "Max film", posts: [{ post_id: 343 }] },
    { episode: "2-fasl 4-qism", name: "Askar", dub: "Max film", posts: [{ post_id: 344 }] },
    { episode: "2-fasl 5-qism", name: "Historiya", dub: "Max film", posts: [{ post_id: 345 }] },
    { episode: "2-fasl 6-qism", name: "Jangchi", dub: "Max film", posts: [{ post_id: 346 }] },
    { episode: "2-fasl 7-qism", name: "Ur; Uloqtir; Qursha", dub: "Max film", posts: [{ post_id: 347 }] },
    { episode: "2-fasl 8-qism", name: "Ovchilar", dub: "Max film", posts: [{ post_id: 348 }] },
    { episode: "2-fasl 9-qism", name: "Kashfiyot", dub: "Max film", posts: [{ post_id: 349 }] },
    { episode: "2-fasl 10-qism", name: "Bolalar", dub: "Max film", posts: [{ post_id: 350 }] },
    { episode: "2-fasl 11-qism", name: "Hujum", dub: "Max film", posts: [{ post_id: 351 }] },
    { episode: "2-fasl 12-qism", name: "Qichqiriq", dub: "Max film", posts: [{ post_id: 352 }] },
    { episode: "3-fasl 1-qism", name: "Tutunli ishora", dub: "Max film", posts: [{ post_id: 353 }] },
    { episode: "3-fasl 2-qism", name: "Og'riq", dub: "Max film", posts: [{ post_id: 354 }] },
    { episode: "3-fasl 3-qism", name: "Eski hikoya", dub: "Max film", posts: [{ post_id: 355 }] },
    { episode: "3-fasl 4-qism", name: "Ishonch", dub: "Max film", posts: [{ post_id: 356 }] },
    { episode: "3-fasl 5-qism", name: "Javob", dub: "Max film", posts: [{ post_id: 357 }] },
    { episode: "3-fasl 6-qism", name: "Gunoh", dub: "Max film", posts: [{ post_id: 358 }] },
    { episode: "3-fasl 7-qism", name: "Istak", dub: "Max film", posts: [{ post_id: 359 }] },
    { episode: "3-fasl 8-qism", name: "Orvud devorlari ortida", dub: "Max film", posts: [{ post_id: 360 }] },
    { episode: "3-fasl 9-qism", name: "Devor hukmdori", dub: "Max film", posts: [{ post_id: 361 }] },
    { episode: "3-fasl 10-qism", name: "Do'stlar", dub: "Max film", posts: [{ post_id: 362 }] },
    { episode: "3-fasl 11-qism", name: "Tomoshabin", dub: "Max film", posts: [{ post_id: 363 }] },
    { episode: "3-fasl 12-qism", name: "Qarshi hujum", dub: "Max film", posts: [{ post_id: 364 }] },
    { episode: "3-fasl 13-qism", name: "Hammasi boshlangan shahar", dub: "Max film", posts: [{ post_id: 365 }] },
    { episode: "3-fasl 14-qism", name: "Chaqmoqli nayza", dub: "Max film", posts: [{ post_id: 366 }] },
    { episode: "3-fasl 15-qism", name: "Pastga tushish", dub: "Max film", posts: [{ post_id: 367 }] },
    { episode: "3-fasl 16-qism", name: "A'lo o'yin", dub: "Max film", posts: [{ post_id: 368 }] },
    { episode: "3-fasl 17-qism", name: "Qahramon", dub: "Max film", posts: [{ post_id: 369 }] },
    { episode: "3-fasl 18-qism", name: "Oq tun", dub: "Max film", posts: [{ post_id: 370 }] },
    { episode: "3-fasl 19-qism", name: "Yerto'la", dub: "Max film", posts: [{ post_id: 371 }] },
    { episode: "3-fasl 20-qism", name: "O'sha kun", dub: "Max film", posts: [{ post_id: 372 }] },
    { episode: "3-fasl 21-qism", name: "Hujumchi titan", dub: "Max film", posts: [{ post_id: 373 }] },
    { episode: "3-fasl 22-qism", name: "Devorning nargi tarafida", dub: "Max film", posts: [{ post_id: 374 }] },
    { episode: "4-fasl 1-qism", name: "Dengizning nargi tarafida", dub: "Max film", posts: [{ post_id: 375 }] },
    { episode: "4-fasl 2-qism", name: "Tungi poyezd", dub: "Max film", posts: [{ post_id: 376 }] },
    { episode: "4-fasl 3-qism", name: "Umid eshiklari", dub: "Max film", posts: [{ post_id: 377 }] },
    { episode: "4-fasl 4-qism", name: "Qo'ldan qo'lga", dub: "Max film", posts: [{ post_id: 378 }] },
    { episode: "4-fasl 5-qism", name: "Urush e'loni", dub: "Max film", posts: [{ post_id: 379 }] },
    { episode: "4-fasl 6-qism", name: "Urush to'qmog'i titani", dub: "Max film", posts: [{ post_id: 380 }] },
    { episode: "4-fasl 7-qism", name: "Hujum", dub: "Max film", posts: [{ post_id: 381 }] },
    { episode: "4-fasl 8-qism", name: "Qotil o'qi", dub: "Max film", posts: [{ post_id: 382 }] },
    { episode: "4-fasl 9-qism", name: "Ko'ngillilar", dub: "Max film", posts: [{ post_id: 383 }] },
    { episode: "4-fasl 10-qism", name: "Isbot", dub: "Max film", posts: [{ post_id: 384 }] },
    { episode: "4-fasl 11-qism", name: "Aldoqchilar", dub: "Max film", posts: [{ post_id: 385 }] },
    { episode: "4-fasl 12-qism", name: "Yetakchi", dub: "Max film", posts: [{ post_id: 386 }] },
    { episode: "4-fasl 13-qism", name: "O'rmon farzandlari", dub: "Max film", posts: [{ post_id: 387 }] },
    { episode: "4-fasl 14-qism", name: "Shavqatsizlik", dub: "Max film", posts: [{ post_id: 388 }] },
    { episode: "4-fasl 15-qism", name: "Yagona ilinj", dub: "Max film", posts: [{ post_id: 389 }] },
    { episode: "4-fasl 16-qism", name: "Samo va yer", dub: "Max film", posts: [{ post_id: 390 }] },
    { episode: "4-fasl 17-qism", name: "Hukm", dub: "Max film", posts: [{ post_id: 391 }] },
    { episode: "4-fasl 18-qism", name: "Kutilmagan zarba", dub: "Max film", posts: [{ post_id: 392 }] },
    { episode: "4-fasl 19-qism", name: "Aka-ukalar", dub: "Max film", posts: [{ post_id: 393 }] },
    { episode: "4-fasl 20-qism", name: "Kelajak xotiralari", dub: "Max film", posts: [{ post_id: 394 }] },
    { episode: "4-fasl 21-qism", name: "Sendan 2000 yil oldin yashaganlar", dub: "Max film", posts: [{ post_id: 395 }] },
    { episode: "4-fasl 22-qism", name: "Ozod qilish", dub: "Max film", posts: [{ post_id: 396 }] },
    { episode: "4-fasl 23-qism", name: "Kun botishi", dub: "Max film", posts: [{ post_id: 397 }] },
    { episode: "4-fasl 24-qism", name: "G'urur", dub: "Max film", posts: [{ post_id: 398 }] },
    { episode: "4-fasl 25-qism", name: "Oxirgi kecha", dub: "Max film", posts: [{ post_id: 399 }] },
    { episode: "4-fasl 26-qism", name: "Sotqinlar", dub: "Max film", posts: [{ post_id: 400 }] },
    { episode: "4-fasl 27-qism", name: "Vatanni qumsash", dub: "Max film", posts: [{ post_id: 401 }] },
    { episode: "4-fasl 28-qism", name: "Insoniyatning shafaqi", dub: "Max film", posts: [{ post_id: 402 }] },
    { episode: "4-fasl 29-qism", name: "Yer titrog'i", dub: "Max film", posts: [{ post_id: 403 }, { post_id: 404 }] },
    { episode: "4-fasl 30-qism", name: "Yer va osmon jangi", dub: "Max film", posts: [{ post_id: 405 }, { post_id: 406 }, { post_id: 407 }] },
];

async function insertEpisodes() {
    try {
        const anime = await db("anime").insert({ name: "Titanlar hujumi", number_of_episode: 89 }).returning("*");
        // await db("anime_info").insert(item).returning("*");

        data.map(async (item, i) => {
            item.anime_id = anime[0].id;
            const post = item.posts;
            delete item.posts;

            const episode = await db("episode").insert(item).returning("*");

            post.forEach((e) => (e.episode_id = episode[0].id));
            await db("channel_post").insert(post);
        });
        console.log("✅ Ma'lumotlar muvaffaqiyatli qo'shildi!");
    } catch (error) {
        console.error(error);
    }
    return 0;
}

insertEpisodes();
