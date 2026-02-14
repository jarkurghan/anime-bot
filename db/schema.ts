import { pgTable, serial, integer, bigint, text } from "drizzle-orm/pg-core";

/** Main bot database — PostgreSQL `"user"` jadvali (kalit so‘z, qo'shtirnoq bilan). */
export const user = pgTable("user", {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull().unique(),
    username: text("username"),
    firstName: text("first_name"),
    lastName: text("last_name"),
});

export const userPage = pgTable("user_page", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => user.id),
    animePage: integer("anime_page").default(0),
    episodePage: integer("episode_page").default(0),
    searching: text("searching").default(""),
    animeId: integer("anime_id"),
});

export const anime = pgTable("anime", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    keys: text("keys"),
    numberOfEpisode: integer("number_of_episode"),
    episodeCount: integer("episode_count"),
});

export const dub = pgTable("dub", {
    id: serial("id").primaryKey(),
    name: text("name"),
});

export const episode = pgTable("episode", {
    id: serial("id").primaryKey(),
    animeId: integer("anime_id").notNull(),
    episode: text("episode").notNull(),
    name: text("name").notNull(),
    dub: text("dub"),
});

export const channelPost = pgTable("channel_post", {
    id: serial("id").primaryKey(),
    episodeId: integer("episode_id").notNull(),
    postId: bigint("post_id", { mode: "number" }).notNull(),
});

/** Alohida USER_DATABASE — kunlik aktivlik */
export const animeBot = pgTable("anime_bot", {
    id: serial("id").primaryKey(),
    date: text("date").notNull(),
    tgName: text("tg_name"),
    tgUserId: bigint("tg_user_id", { mode: "number" }).notNull(),
    tgUsername: text("tg_username"),
    clicked: integer("clicked").notNull().default(1),
});
