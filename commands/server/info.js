// ===========================================
// 📄 File: commands/server/info.js
// ===========================================
export const command = "info";
export async function handler(bot, m) {
    // 🔐 Ambil metadata grup untuk cari admin
    const metadata = await bot.groupMetadata(m.chatId);
    const admins = metadata.participants.filter(p => p.admin !== null);
    const targetAdmin = admins[0]?.id; // ambil satu admin (pertama)

    // Jika tidak ada admin, fallback ke nomor owner kamu
    const mentionId = targetAdmin || "6285788918217@s.whatsapp.net";
    const mentionTag = `@${mentionId.split("@")[0]}`;

    const infoText = `
*TENTANG 🜲FANRABOT*
════════════════════════════
\`■ Version                   ➠\`
*╰┈➤ I* 2.0.0
\`■ Owner                     ➠\`
*╰┈➤ I* Irfan Rizki Aditri
\`■ WhatsApp                  ➠\`
*╰┈➤ I* wa.me/6285788918217
\`■ Group                     ➠\`
*╰┈➤ I* https://taplink.cc/grupfriendszone
════════════════════════════
\`■ ${mentionTag} ➠\`
`.trim();

    await bot.sendMessage(
        m.chatId,
        {
            text: infoText,
            mentions: [mentionId]
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
                    conversation: `*🜲FANRABOT │ ${m.pushName || "User"}*: 💬 ${
                        m.text || "No message"
                    }`
                }
            }
        }
    );
}

handler.command = "info";
handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
