export const command = "hidetag";

export async function handler(bot, m) {
    console.log("👉 .hidetag command triggered by", m.senderId);

    // ❌ Grup only
    if (!m.isGroup)
        return m.reply("❌ Perintah ini hanya bisa digunakan di dalam grup.");

    // ✅ Ambil data grup
    const groupMetadata = await bot.groupMetadata(m.chatId);

    // ✅ Cek apakah pengirim admin
    const senderIsAdmin = groupMetadata.participants.find(
        p =>
            p.id === m.senderId &&
            (p.admin === "admin" || p.admin === "superadmin")
    );

    if (!senderIsAdmin) {
        return m.reply(
            "❌ Hanya admin grup yang boleh menggunakan perintah ini."
        );
    }

    const teks = m.args.join(" ").trim();

    if (!teks) {
        // Tanpa teks, hanya tag pengirim sendiri
        await bot.sendMessage(
            m.chatId,
            {
                text: `@${m.senderId.split("@")[0]}`,
                mentions: [m.senderId]
            },
            {
                quoted: {
                    key: {
                        id: m.id,
                        fromMe: false,
                        remoteJid: "status@broadcast",
                        participant: "0@s.whatsapp.net"
                    },
                    message: {
                        conversation: `*🜲FANRABOT │ ${
                            m.pushName || "User"
                        }*: 💬 ${m.text || "No message"}`
                    }
                }
            }
        );
    } else {
        // Dengan teks, tag semua anggota
        const mentions = groupMetadata.participants.map(p => p.id);

        await bot.sendMessage(
            m.chatId,
            {
                text: teks,
                mentions
            },
            {
                quoted: {
                    key: {
                        id: m.id,
                        fromMe: false,
                        remoteJid: "status@broadcast",
                        participant: "0@s.whatsapp.net"
                    },
                    message: {
                        conversation: `*🜲FANRABOT │ ${
                            m.pushName || "User"
                        }*: 💬 ${m.text || "No message"}`
                    }
                }
            }
        );
    }
}
