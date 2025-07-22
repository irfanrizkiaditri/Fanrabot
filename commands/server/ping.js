export const command = "ping";
export async function handler(bot, m) {
    const start = performance.now();

    // Kirim pesan awal "🏓 Pong"
    const sent = await bot.sendMessage(
        m.chatId,
        {
            text: "🏓 Pong"
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
                    conversation: `*🜲FANRABOT │ ${m.pushName || "User"}*: 💬 ${
                        m.text || "No message"
                    }`
                }
            }
        }
    );

    // Hitung latency
    const latency = performance.now() - start;

    // Ambil uptime (dalam detik)
    const uptime = process.uptime(); // detik
    const h = String(Math.floor(uptime / 3600)).padStart(2, "0");
    const mnt = String(Math.floor((uptime % 3600) / 60)).padStart(2, "0");
    const s = String(Math.floor(uptime % 60)).padStart(2, "0");

    // Format akhir: 📡 123ms (00:15:42)
    const result = `📡 \`${latency.toFixed(0)}ms (${h}:${mnt}:${s})\``;

    // Edit pesan "Pong" jadi hasil akhir
    await bot.sendMessage(m.chatId, {
        text: result,
        edit: sent.key
    });
}

handler.command = "ping";
handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
