// import { Hono } from "hono";
// import { handleUpdate } from "@/bot.ts";
// import { logger } from "hono/logger";

// const app = new Hono();

// app.use("*", logger());

// app.get("/", (c) => c.text("Hello Hono!"));
// app.post("/bot", handleUpdate);

// export default app;

import { startBot } from "@/bot.ts";

startBot();

