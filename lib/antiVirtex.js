export default async function antiVirtex(bot, m) {
    if (!m.isGroup || !m.text) return;

    const virtexDetected =
        (m.text.match(/[\u2060\u200B\u200E\u202E\uFFF9-\uFFFB]/g) || [])
            .length > 20;

    if (!virtexDetected) return;

    try {
        // Hapus pesan virtex
        await bot.sendMessage(m.chatId, {
            delete: {
                remoteJid: m.chatId,
                fromMe: false,
                id: m.key.id,
                participant: m.key.participant || m.senderId
            }
        });

        // Kirim peringatan reply
        await bot.sendMessage(
            m.chatId,
            {
                text: `⚠️ Potential virtex/virus detected and removed. Be careful, @${
                    m.senderId.split("@")[0]
                }!`,
                mentions: [m.senderId]
            },
            {
                quoted: {
                    key: {
                        id: m.key.id,
                        fromMe: false,
                        remoteJid: "status@broadcast",
                        participant: "0@s.whatsapp.net"
                    },
                    message: {
                        conversation: "*🜲FANRABOT │ FRIENDSZONE*"
                    }
                }
            }
        );
    } catch (err) {
        console.error("AntiVirtex error:", err.message);
    }
}
