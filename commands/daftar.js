export const command = "daftar";

export async function handler(bot, m) {
    const teks = m.text?.trim().split(" ").slice(1).join(" "); // Ambil teks setelah command

    if (!teks) {
        return bot.sendMessage(
            m.chatId,
            {
                text: "❌ Format salah.\n\nGunakan: `.daftar <namamu>`\nContoh: .daftar Fanra"
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

    const users = global.db.user;
    const id = m.senderId;

    if (users[id]) return m.reply("✅ Kamu sudah terdaftar sebelumnya.");

    users[id] = {
        name: teks, // Sekarang hanya "Fanra", bukan "daftar Fanra"
        level: 1,
        poin: 0,
        saldo: 0
    };

    await global.db.save("user");

    return bot.sendMessage(
        m.chatId,
        {
            text: `✅ Berhasil mendaftar sebagai *${teks}*!`
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
}
