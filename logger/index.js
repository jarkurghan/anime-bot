import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function logError(command, error) {
    try {
        const logsDir = path.join(__dirname, "logs");
        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

        const logFilePath = path.join(logsDir, `${new Date().getTime()}_${command}.log`);
        const logMessage = `${new Date().toISOString()}\n\n${error.stack}`;

        fs.appendFileSync(logFilePath, logMessage, "utf8");
    } catch (err) {
        console.log(err);
    }
}
