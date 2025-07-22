export const command = "time";
export async function handler(bot, m) {
    const sender = m.senderId?.split("@")[0];

    const customQuoted = {
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
    };

    if (sender !== "6285788918217") {
        return await bot.sendMessage(
            m.chatId,
            { text: "❌ Hanya owner yang bisa mengganti waktu." },
            { quoted: customQuoted }
        );
    }

    const input = m.args[0];
    if (!input || !/^([0-2]\d):[0-5]\d\/([0-2]\d):[0-5]\d$/.test(input)) {
        return await bot.sendMessage(
            m.chatId,
            {
                text: "Format salah!\nContoh: `.time 22:30/05:00`"
            },
            { quoted: customQuoted }
        );
    }

    const [closeTime, openTime] = input.split("/");
    global.bot.setting.autolock.closeTime = closeTime;
    global.bot.setting.autolock.openTime = openTime;
    global.bot.saveSetting();

    return await bot.sendMessage(
        m.chatId,
        {
            text: `✅ Waktu autolock diubah:\n🔒 Tutup: ${closeTime}\n🔓 Buka: ${openTime}`
        },
        { quoted: customQuoted }
    );
}

handler.command = "time";
handler.private = false;
handler.onlyOwner = true;
handler.onlyPremium = false;
