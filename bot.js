// 📄 File: bot.js
import fs from "fs";
import "./config/bot.js";
import {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    isJidNewsletter
} from "@whiskeysockets/baileys";
import pino from "pino";

// ✅ Import utils dan event handler
import question from "./utils/question.js";
import handleMessage from "./events/messages.upsert.js";
import welcomeHandler from "./events/welcome.js";
import { loadCommands } from "./utils/commandLoader.js";
import chalk from "chalk";

// ✅ Inisialisasi database pengguna (jangan diubah urutan ini!)
if (!global.db) global.db = {};
if (!global.db.users) global.db.users = [];

// ✅ Deklarasi global.bot (WAJIB ADA!)
global.bot = {
    prefix: ".",
    splitArgs: / +/,
    commands: [],
    setting: {
        autolock: {
            status: true,
            openTime: "05:00",
            closeTime: "22:30",
            groups: []
        }
    }
};

// ✅ Nomor yang boleh login
const allowedNumbers = JSON.parse(
    fs.readFileSync("./config/allowed.json", "utf-8")
);

// ✅ Parse pesan
function parseMessage(m) {
    if (!m || !m.message) return null;
    const type = Object.keys(m.message)[0];
    const content = m.message[type];
    return {
        ...m,
        type,
        text:
            type === "conversation"
                ? content
                : content?.caption ||
                  content?.text ||
                  content?.selectedDisplayText ||
                  ""
    };
}

// ✅ Start bot
(async function start(usePairingCode = true) {
    const session = await useMultiFileAuthState("session");

    const bot = makeWASocket({
        version: (await fetchLatestBaileysVersion()).version,
        printQRInTerminal: !usePairingCode,
        auth: session.state,
        logger: pino({ level: "silent" }),
        shouldIgnoreJid: jid => isJidNewsletter(jid)
    });

    // 🔐 Pairing code
    if (usePairingCode && !bot.user && !bot.authState.creds.registered) {
        const jawab = await question(
            "Ingin terhubung menggunakan pairing code? [Y/n]: "
        );
        if (jawab.toLowerCase() === "n") return start(false);

        const waNumber = (
            await question("Masukkan nomor WhatsApp anda: +")
        ).replace(/\D/g, "");

        if (!allowedNumbers.includes(waNumber)) {
            console.log(
                `\x1b[35;1mNomor ini tidak memiliki akses untuk menggunakan script whatsapp bot ini\x1b[0m\n-> SILAHKAN MEMESAN SCRIPT INI KE ${global.owner.name} WA ${global.owner.number}`
            );
            return process.exit();
        }

        const code = await bot.requestPairingCode(waNumber);
        console.log(`\x1b[44;1m\x20PAIRING CODE\x20\x1b[0m\x20${code}`);
    }

    // 🔄 Reconnect logic
    bot.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            console.log(lastDisconnect?.error);
            const { statusCode, error } =
                lastDisconnect?.error?.output?.payload || {};
            if (statusCode === 401 && error === "Unauthorized") {
                await fs.promises.rm("session", {
                    recursive: true,
                    force: true
                });
            }
            return start(); // reconnect
        }

        if (connection === "open") {
            const currentUser = bot.user.id.split(":")[0];
            if (!allowedNumbers.includes(currentUser)) {
                console.log(
                    `\x1b[35;1mNomor ini tidak memiliki akses untuk menggunakan script whatsapp bot ini\x1b[0m\n-> SILAHKAN MEMESAN SCRIPT INI KE ${global.owner.name} WA ${global.owner.number}`
                );
                return process.exit();
            }

            console.log(`\n\x1b[1;36m✅ 🜲FANRABOT CONNECTED\x1b[0m`);
            console.log(
                `   ╰┈➤ ⌞ WA Number: \x1b[1;32m${currentUser}\x1b[0m ⌝\n`
            );

            // 📩 Load commands (wajib agar .tagall bisa jalan!)
            await loadCommands(global.bot);

            // 🎉 Welcome event
            bot.ev.on("group-participants.update", update =>
                welcomeHandler(bot, update)
            );

            // ⏰ Auto lock/unlock
            setInterval(async () => {
                const now = new Date();
                const jam = now.toTimeString().slice(0, 5);
                const { status, closeTime, openTime, groups } =
                    global.bot.setting.autolock;
                if (!status) return;

                const motivasiPagi = [
                    "Selamat pagi semua! Grup resmi dibuka kembali~ 🌞",
                    "Pagi adalah awal dari harapan baru. 😊",
                    "Bangun pagi = siap jadi lebih baik 🌅",
                    "Jadikan hari ini bermakna 🚀",
                    "Awali harimu dengan doa dan niat baik ☕"
                ];

                const motivasiMalam = [
                    "Sudah malam, saatnya istirahat 🌙",
                    "Grup ditutup sementara, selamat malam 🌌",
                    "Saatnya tenang & recharge 😴",
                    "Malam bukan akhir, tapi jeda ✨",
                    "Terima kasih untuk hari ini 🛌"
                ];

                for (let groupId of groups) {
                    if (jam === closeTime) {
                        await bot.groupSettingUpdate(groupId, "announcement");
                        await bot.sendMessage(groupId, {
                            text: `🌙 \`${closeTime}\`\n\n${
                                motivasiMalam[
                                    Math.floor(
                                        Math.random() * motivasiMalam.length
                                    )
                                ]
                            }`
                        });
                    }

                    if (jam === openTime) {
                        await bot.groupSettingUpdate(
                            groupId,
                            "not_announcement"
                        );
                        await bot.sendMessage(groupId, {
                            text: `🌞 \`${openTime}\`\n\n${
                                motivasiPagi[
                                    Math.floor(
                                        Math.random() * motivasiPagi.length
                                    )
                                ]
                            }`
                        });
                    }
                }
            }, 60_000);
        }
    });

    // 💾 Save session
    bot.ev.on("creds.update", session.saveCreds);

    // 📩 Handle pesan masuk
    bot.ev.on("messages.upsert", async ({ messages }) => {
        const m = parseMessage(messages[0]);
        if (!m) return;
        await handleMessage(bot, m);
    });
})();
