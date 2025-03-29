const db = require("../db");
const data = [
    { episode: "1-qism", name: "Tug'ilish", dub: "Max film", posts: [{ post_id: 409 }] },
    { episode: "2-qism", name: "Qo'zg'olon", dub: "Max film", posts: [{ post_id: 410 }] },
    { episode: "3-qism", name: "Muzokara", dub: "Max film", posts: [{ post_id: 411 }] },
    { episode: "4-qism", name: "Ko'z yumguncha", dub: "Max film", posts: [{ post_id: 412 }] },
    { episode: "5-qism", name: "Taktika", dub: "Max film", posts: [{ post_id: 413 }] },
    { episode: "6-qism", name: "O'yin boshlanmoqda", dub: "Max film", posts: [{ post_id: 414 }] },
    { episode: "7-qism", name: "To'liq ko'rish", dub: "Max film", posts: [{ post_id: 415 }] },
    { episode: "8-qism", name: "Ko'z", dub: "Max film", posts: [{ post_id: 416 }] },
    { episode: "9-qism", name: "Taqib", dub: "Max film", posts: [{ post_id: 417 }] },
    { episode: "10-qism", name: "Shubha", dub: "Max film", posts: [{ post_id: 418 }] },
    { episode: "11-qism", name: "Hujum", dub: "Max film", posts: [{ post_id: 419 }] },
    { episode: "12-qism", name: "Sevgi", dub: "Max film", posts: [{ post_id: 420 }] },
    { episode: "13-qism", name: "Qasos", dub: "Max film", posts: [{ post_id: 421 }] },
    { episode: "14-qism", name: "Do'st", dub: "Max film", posts: [{ post_id: 422 }] },
    { episode: "15-qism", name: "Jang", dub: "Max film", posts: [{ post_id: 423 }] },
    { episode: "16-qism", name: "Qaror", dub: "Max film", posts: [{ post_id: 424 }] },
    { episode: "17-qism", name: "Boshqaruv", dub: "Max film", posts: [{ post_id: 425 }] },
    { episode: "18-qism", name: "Yolg'iz", dub: "Max film", posts: [{ post_id: 426 }] },
    { episode: "19-qism", name: "Ota", dub: "Max film", posts: [{ post_id: 427 }] },
    { episode: "20-qism", name: "Yordam", dub: "Max film", posts: [{ post_id: 428 }] },
    { episode: "21-qism", name: "Faoliyat", dub: "Max film", posts: [{ post_id: 429 }] },
    { episode: "22-qism", name: "Ishonch", dub: "Max film", posts: [{ post_id: 430 }] },
    { episode: "23-qism", name: "Qo'rquv", dub: "Max film", posts: [{ post_id: 431 }] },
    { episode: "24-qism", name: "Tirik qo'llar", dub: "Max film", posts: [{ post_id: 432 }] },
    { episode: "25-qism", name: "Tinimsiz", dub: "Max film", posts: [{ post_id: 433 }] },
    { episode: "26-qism", name: "Tug'ilish", dub: "Max film", posts: [{ post_id: 434 }] },
    { episode: "27-qism", name: "Birlashish", dub: "Max film", posts: [{ post_id: 435 }] },
    { episode: "28-qism", name: "Ko'rishguncha", dub: "Max film", posts: [{ post_id: 436 }] },
    { episode: "29-qism", name: "Adolat", dub: "Max film", posts: [{ post_id: 437 }] },
    { episode: "30-qism", name: "Yolg'on", dub: "Max film", posts: [{ post_id: 438 }] },
    { episode: "31-qism", name: "To'g'ri yo'l", dub: "Max film", posts: [{ post_id: 439 }] },
    { episode: "32-qism", name: "Tanlov", dub: "Max film", posts: [{ post_id: 440 }] },
    { episode: "33-qism", name: "Ko'z yoshi", dub: "Max film", posts: [{ post_id: 441 }] },
    { episode: "34-qism", name: "Qo'rqinchli", dub: "Max film", posts: [{ post_id: 442 }] },
    { episode: "35-qism", name: "Shafqatsiz", dub: "Max film", posts: [{ post_id: 443 }] },
    { episode: "36-qism", name: "28-yanvar", dub: "Max film", posts: [{ post_id: 444 }] },
    { episode: "37-qism", name: "Yangi dunyo", dub: "Max film", posts: [{ post_id: 445 }] },
];

async function insertEpisodes() {
    try {
        const anime = await db("anime").insert({ name: "O'lim kundaligi", number_of_episode: 37 }).returning("*");
        // await db("anime_info").insert(item).returning("*");

        data.map(async (item) => {
            item.anime_id = anime[0].id;
            const post = item.posts[0];
            delete item.posts;

            const episode = await db("episode").insert(item).returning("*");

            post.episode_id = episode[0].id;
            await db("channel_post").insert(post);
        });
        console.log("✅ Ma'lumotlar muvaffaqiyatli qo'shildi!");
    } catch (error) {
        console.error(error);
    }
    return 0;
}

insertEpisodes();
