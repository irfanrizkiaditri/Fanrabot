export const command = "profil";

export async function handler(bot, m) {
    const users = global.db.user;
    const user = users[m.senderId];

    const teks = user
        ? `👤 *PROFIL KAMU*\n\n` +
          `\`• Nama   :\` *${user.name}*\n` +
          `\`• Level  :\` *${user.level}*\n` +
          `\`• Poin   :\` *${user.xp} / ${user.level * 50}*\n` +
          `\`• Saldo  :\` *Rp ${user.saldo.toLocaleString("id-ID")}*`
        : "❌ Kamu belum terdaftar.\n\nSilakan daftar dengan perintah:\n`.daftar (namamu)`\n*Contoh:* _.daftar fanra_";

    await bot.sendMessage(
        m.chatId,
        { text: teks },
        {
            quoted: {
                key: {
                    id: m.id,
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
