export const BOT_TOKEN = process.env.BOT_TOKEN || "";

export const USER_STATUS = ["active", "inactive", "deleted_account", "has_blocked", "other"] as const;

export const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "";
export const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || "";
export const CHANNEL = process.env.CHANNEL_ID || "";

export const DB_HOST = process.env.DB_HOST || "";
export const DB_PORT = process.env.DB_PORT || "";
export const DB_USER = process.env.DB_USER || "";
export const DB_NAME = process.env.DB_NAME || "";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";

export const IS_HAVE_DATABASE = DB_HOST && DB_PORT && DB_USER && DB_PASSWORD && DB_NAME;
export const DATABASE_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

export const PAGE_SIZE = 10;
