const knex = require("./db/db");

async function name() {
    try {
        const data = [
            { episode: "1-fasl 1-qism", name: "", posts: [{ post_id: 1089 }] },
            { episode: "1-fasl 2-qism", name: "", posts: [{ post_id: 1090 }] },
            { episode: "1-fasl 3-qism", name: "", posts: [{ post_id: 1091 }] },
            { episode: "1-fasl 4-qism", name: "", posts: [{ post_id: 1092 }] },
            { episode: "1-fasl 5-qism", name: "", posts: [{ post_id: 1093 }] },
            { episode: "1-fasl 6-qism", name: "", posts: [{ post_id: 1094 }] },
            { episode: "1-fasl 7-qism", name: "", posts: [{ post_id: 1095 }] },
            { episode: "1-fasl 8-qism", name: "", posts: [{ post_id: 1096 }] },
            { episode: "1-fasl 9-qism", name: "", posts: [{ post_id: 1097 }] },
            { episode: "1-fasl 10-qism", name: "", posts: [{ post_id: 1098 }] },
            { episode: "1-fasl 11-qism", name: "", posts: [{ post_id: 1099 }] },
            { episode: "1-fasl 12-qism", name: "", posts: [{ post_id: 1100 }] },
            { episode: "1-fasl 13-qism", name: "", posts: [{ post_id: 1101 }] },
            { episode: "1-fasl 14-qism", name: "", posts: [{ post_id: 1102 }] },
            { episode: "1-fasl 15-qism", name: "", posts: [{ post_id: 1103 }] },
            { episode: "1-fasl 16-qism", name: "", posts: [{ post_id: 1104 }] },
            { episode: "1-fasl 17-qism", name: "", posts: [{ post_id: 1105 }] },
            { episode: "1-fasl 18-qism", name: "", posts: [{ post_id: 1106 }] },
            { episode: "1-fasl 19-qism", name: "", posts: [{ post_id: 1107 }] },
            { episode: "1-fasl 20-qism", name: "", posts: [{ post_id: 1108 }] },
            { episode: "1-fasl 21-qism", name: "", posts: [{ post_id: 1109 }] },
            { episode: "1-fasl 22-qism", name: "", posts: [{ post_id: 1110 }] },
            { episode: "1-fasl 23-qism", name: "", posts: [{ post_id: 1111 }] },
            { episode: "1-fasl 24-qism", name: "", posts: [{ post_id: 1112 }] },
            { episode: "2-fasl 1-qism", name: "", posts: [{ post_id: 1113 }] },
            { episode: "2-fasl 2-qism", name: "", posts: [{ post_id: 1114 }] },
            { episode: "2-fasl 3-qism", name: "", posts: [{ post_id: 1115 }] },
            { episode: "2-fasl 4-qism", name: "", posts: [{ post_id: 1116 }] },
            { episode: "2-fasl 5-qism", name: "", posts: [{ post_id: 1117 }] },
            { episode: "2-fasl 6-qism", name: "", posts: [{ post_id: 1118 }] },
            { episode: "2-fasl 7-qism", name: "", posts: [{ post_id: 1119 }] },
            { episode: "2-fasl 8-qism", name: "", posts: [{ post_id: 1120 }] },
            { episode: "2-fasl 9-qism", name: "", posts: [{ post_id: 1121 }] },
            { episode: "2-fasl 10-qism", name: "", posts: [{ post_id: 1122 }] },
            { episode: "2-fasl 11-qism", name: "", posts: [{ post_id: 1123 }] },
            { episode: "2-fasl 12-qism", name: "", posts: [{ post_id: 1124 }] },
            { episode: "2-fasl 13-qism", name: "", posts: [{ post_id: 1125 }] },
            { episode: "2-fasl 14-qism", name: "", posts: [{ post_id: 1126 }] },
        ];

        const oxshashNomlar = ["Blue lock"];

        const anibla = await knex("dub").where("name", "Anibla").first();
        data.forEach((e) => (e.dub = anibla.id));
        const anime = await knex("anime")
            .insert({ name: "Ko'k zindon", keys: oxshashNomlar.join(";"), number_of_episode: 47, status: "to'liq" })
            .returning("*");
        await knex("anime_info").insert([
            { post_id: 1049, anime_id: anime[0].id },
            { post_id: 1050, anime_id: anime[0].id },
        ]);

        for (const item of data) {
            item.anime_id = anime[0].id;
            const post = item.posts;
            delete item.posts;

            const episode = await knex("episode").insert(item).returning("*");

            post.forEach((e) => (e.episode_id = episode[0].id));
            await knex("channel_post").insert(post);
        }
    } catch (error) {
        console.error(error);
    }
}

name();
