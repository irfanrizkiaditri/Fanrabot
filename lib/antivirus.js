export default async function antivirus(bot, m) {
    if (!m.isGroup || !m.text) return;

    const text = m.text;
    const virusDetected =
        text.length > 4000 ||
        /<svg|<script|eval\(|\u200B|\u2060|\u202E/.test(text);

    if (!virusDetected) return;

    try {
        // Hapus pesan mencurigakan
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
                text: `⚠️ Virus/virtex-like content detected and removed. Stay safe, @${
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
        console.error("Antivirus error:", err.message);
    }
}
