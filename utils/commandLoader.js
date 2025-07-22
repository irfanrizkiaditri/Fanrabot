// 📄 File: utils/commandLoader.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands(bot) {
    const commandsPath = path.join(__dirname, "../commands");

    bot.commands = []; // 🧹 Bersihkan agar tidak duplikat

    async function readCommands(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                await readCommands(fullPath); // Rekursif ke folder dalam
            } else if (file.endsWith(".js")) {
                try {
                    const { handler, command } = await import(
                        `file://${fullPath}`
                    );
                    if (
                        typeof handler === "function" &&
                        typeof command === "string"
                    ) {
                        bot.commands.push({ command, handler });
                        console.log(
                            `\x1b[32m[Loaded Command]\x1b[0m ${command}`
                        );
                    }
                } catch (err) {
                    console.error(
                        `[Loader] Failed to load ${file}:`,
                        err.message
                    );
                }
            }
        }
    }

    await readCommands(commandsPath);

    // ✅ Log total command
    const loaded = bot.commands.map(cmd => cmd.command);
    // console.log(`[Loaded Command] ${command}`);
}
