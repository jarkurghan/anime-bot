import { pgTable, serial, integer, bigint, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { USER_STATUS } from "@/utils/constants.ts";

export const abu = pgTable("user", {
    id: serial("id").primaryKey(),
    tg_id: varchar("tg_id", { length: 255 }).notNull().unique(),
    first_name: text("first_name"),
    last_name: text("last_name"),
    username: text("username"),
    referred_by: integer("referred_by"),
    today_count: integer("today_count").default(0).notNull(),
    total_count: integer("total_count").default(0).notNull(),
    status: text("status", { enum: USER_STATUS }).default("active").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

export const abup = pgTable("user_page", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
        .notNull()
        .references(() => abu.id),
    anime_page: integer("anime_page").default(0),
    episode_page: integer("episode_page").default(0),
    searching: text("searching").default(""),
    anime_id: integer("anime_id"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

export const anime = pgTable("anime", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    keys: text("keys"),
    number_of_episode: integer("number_of_episode"),
});

export const dub = pgTable("dub", {
    id: serial("id").primaryKey(),
    username: text("username"),
    name: text("name"),
});

export const episode = pgTable("episode", {
    id: serial("id").primaryKey(),
    today_count: integer("today_count").default(0).notNull(),
    total_count: integer("total_count").default(0).notNull(),
    anime_id: integer("anime_id").notNull(),
    episode: text("episode").notNull(),
    name: text("name").notNull(),
    dub: text("dub"),
});

export const channelPost = pgTable("channel_post", {
    id: serial("id").primaryKey(),
    episode_id: integer("episode_id").notNull(),
    post_id: bigint("post_id", { mode: "number" }).notNull(),
});

export const animeInfo = pgTable("anime_info", {
    id: serial("id").primaryKey(),
    post_id: bigint("post_id", { mode: "number" }).notNull(),
    anime_id: integer("anime_id").notNull(),
});
