import {
    isJidGroup,
    isJidUser,
    isJidStatusBroadcast,
    jidDecode,
    jidNormalizedUser,
    getContentType,
    isJidNewsletter,
    jidEncode
} from "@whiskeysockets/baileys";

import notifyEvent from "../utils/notifyEvent.js";
import antiLink from "../lib/antilink.js";
import antiBadword from "../lib/antibadword.js";
import antiSpam from "../lib/antispam.js";
import antivirus from "../lib/antivirus.js";
import antiVirtex from "../lib/antiVirtex.js";
import sapaan from "../lib/sapaan.js";
import { monitorChatActivity } from "./chatactivity.js";
import { loadCommands } from "../utils/commandLoader.js";

// 🔧 Parse pesan jadi bentuk lebih gampang dibaca
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

// 🧠 Handler utama semua pesan
export default async function handleMessage(bot, mRaw) {
    const m = parseMessage(mRaw);
    if (!m) return;

    try {
        // 🧩 Properti tambahan biar lebih fleksibel
        m.id = m.key.id;
        m.chatId = m.key.remoteJid;
        m.isGroup = isJidGroup(m.chatId);
        m.isPrivate = isJidUser(m.chatId);
        m.isStory = isJidStatusBroadcast(m.chatId);
        m.isNewsletter = isJidNewsletter(m.chatId);
        m.senderId = m.key.participant || m.participant || m.key.remoteJid;
        m.fromMe = m.key.fromMe;

        // 👑 Cek apakah dia owner bot
        const decodedSender = jidDecode(m.senderId) || {};
        m.isOwner = decodedSender.user === global.owner.number;

        // 🌟 Premium user
        m.isPremium = !!global.db.premium.find(
            user => jidEncode(user, "s.whatsapp.net") === m.senderId
        );

        // 📩 Isi pesan
        m.type = getContentType(m.message);
        m.body =
            m.type === "conversation"
                ? m.message.conversation
                : m.message[m.type]?.caption ||
                  m.message[m.type]?.text ||
                  m.message[m.type]?.singleSelectReply?.selectedRowId ||
                  m.message[m.type]?.selectedButtonId ||
                  (m.message[m.type]?.nativeFlowResponseMessage?.paramsJson
                      ? JSON.parse(
                            m.message[m.type].nativeFlowResponseMessage
                                .paramsJson
                        ).id
                      : "") ||
                  "";
        m.text =
            m.type === "conversation"
                ? m.message.conversation
                : m.message[m.type]?.caption ||
                  m.message[m.type]?.text ||
                  m.message[m.type]?.description ||
                  m.message[m.type]?.title ||
                  m.message[m.type]?.contentText ||
                  m.message[m.type]?.selectedDisplayText ||
                  "";

        // Deteksi prefix yang digunakan
        const prefixes = Array.isArray(global.bot.prefix)
            ? global.bot.prefix
            : [global.bot.prefix];

        m.prefixUsed = prefixes.find(p => m.text?.startsWith(p));
        m.isCommand = !!m.prefixUsed;

        m.cmd = m.isCommand
            ? m.text.slice(m.prefixUsed.length).split(" ")[0].toLowerCase()
            : "";

        m.args = m.isCommand
            ? m.text
                  .slice(m.prefixUsed.length)
                  .trim()
                  .split(global.bot.splitArgs)
                  .map(x => x.trim())
            : [];

        // 🔁 Fungsi reply cepat
        m.reply = text =>
            bot.sendMessage(
                m.chatId,
                { text },
                {
                    quoted: {
                        key: {
                            id: m.id,
                            fromMe: false,
                            remoteJid: m.chatId,
                            participant: m.senderId
                        },
                        message: {
                            conversation: `💬 ${m.text}`
                        }
                    }
                }
            );

        // 💬 Tambah poin aktif tiap kali user kirim pesan
        const userId = m.senderId;
        if (!global.db.user[userId]) {
            global.db.user[userId] = {
                name: m.pushName || "NoName",
                level: 1,
                xp: 0,
                saldo: 0
            };
        }

        const user = global.db.user[userId];
        user.xp += 1; // tambah 1 poin aktif

        // 🎯 Naik level jika cukup poin
        const requiredXp = user.level * 50;
        if (user.xp >= requiredXp) {
            user.level++;
            m.reply(
                `🎉 Selamat ${user.name}, kamu naik ke level ${user.level}!`
            );
        }

        // 💾 Simpan database user
        global.db.save("user");

        // 🛡️ Jalankan fitur proteksi
        await antiSpam(bot, m);
        await antiLink(bot, m);
        await antiBadword(bot, m);
        await antivirus(bot, m);
        await antiVirtex(bot, m);
        await sapaan(bot, m);
        await monitorChatActivity(bot, m);

        // 🤖 Auto-react jika seseorang membalas pesan dari bot
        const contextInfo = m.message?.extendedTextMessage?.contextInfo;
        if (
            contextInfo?.quotedMessage &&
            jidDecode(contextInfo.participant || "")?.user ===
                jidDecode(bot.user.id)?.user
        ) {
            const emojiList = [
                // Senang / Friendly
                "😊",
                "😄",
                "😁",
                "😌",
                "🙂",
                "🙃",
                // Imut / Lucu
                "🥰",
                "😋",
                "😛",
                "😜",
                "🤪",
                "😹",
                // Bingung / Reaksi absurd
                "😕",
                "🤨",
                "🫤",
                "😵‍💫",
                "🫠",
                "🥴",
                // Marah / Sassy
                "😤",
                "😠",
                "😑",
                "🙄",
                "😒",
                "😬",
                // Reaksi sarkas / nyinyir
                "😎",
                "😏",
                "🫢",
                "🤭",
                "😶‍🌫️",
                "🤔",
                // Sedih / Drama
                "🥺",
                "😢",
                "😭",
                "😖",
                "😓",
                "😩"
            ];
            const randomEmoji =
                emojiList[Math.floor(Math.random() * emojiList.length)];
            await bot.sendMessage(m.chatId, {
                react: {
                    text: randomEmoji,
                    key: {
                        id: m.id, // 👉 ini adalah ID pesan user
                        remoteJid: m.chatId,
                        fromMe: false // karena ini pesan dari user
                    }
                }
            });
        }

        // 🪵 Log pesan
        notifyEvent(
            "Message Upsert",
            `
Dari: ${m.senderId}
Nama: ${m.pushName || "NoName"}
Pesan: ${m.text}
`.trim()
        );

        // ⚙️ Cek dan jalankan command
        for await (let command of global.bot.commands) {
            if (command.command === m.cmd) {
                const handler = command.handler;

                if (handler?.private && m.isGroup) return;
                if (handler?.onlyOwner && !m.isOwner && !m.fromMe)
                    return m.reply("❌ Only the owner can run this command.");
                if (
                    handler?.onlyPremium &&
                    !m.isOwner &&
                    !m.fromMe &&
                    !m.isPremium
                )
                    return m.reply(
                        "❌ Only the owner or premium users can use this command."
                    );

                if (handler) {
                    await handler(bot, m);
                } else {
                    return m.reply("⚠️ Command handler not found.");
                }

                return;
            }
        }

        // 🎮 Gomu Game (jawaban angka)
        if (/^\d+$/.test(m.text)) {
            const { handlePlayerMove } = await import(
                "../commands/game/gomu.js"
            );
            await handlePlayerMove(bot, m, Number(m.text));
        }
    } catch (err) {
        // ❌ Error catcher
        notifyEvent(
            "Message Upsert",
            `
Dari: ${m?.senderId}
Nama: ${m?.pushName || "NoName"}
Pesan: ${m?.text}
Error: ${err?.message}
`.trim(),
            "error"
        );
        console.log(err);
        m?.reply?.(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
