// =====================================
// 📄 File: plugins/antilink.js
// =====================================
// 🔗 ANTI LINK SYSTEM - 🜲FANRABOT FRIENDSZONE
// =====================================

const trustedLinks = [
    // ✅ Daftar domain link yang dianggap aman
    "whatsapp.com",
    "chat.whatsapp.com",
    "instagram.com",
    "tiktok.com",
    "facebook.com",
    "youtu.be",
    "youtube.com",
    "twitter.com",
    "roblox.com",
    "discord.gg",
    "discord.com",
    "shopee.co.id",
    "tokopedia.com",
    "bukalapak.com",
    "grab.com",
    "gojek.com",
    "linktr.ee",
    "bit.ly",
    "taplink.cc"
];

/**
 * 🔍 Deteksi link mencurigakan & hapus jika tidak tag admin
 * @param {import('@whiskeysockets/baileys').WASocket} bot
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} m
 */
export default async function antiLink(bot, m) {
    // 🛑 Hanya jalan di grup & ada teks
    if (!m.isGroup || !m.text) return;

    const text = m.text.toLowerCase();
    const linkRegex = /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/[a-zA-Z0-9]+)/gi;
    const foundLinks = text.match(linkRegex);
    if (!foundLinks) return;

    // ✅ Cek apakah link yang ditemukan termasuk yang aman
    const isTrusted = foundLinks.every(link => {
        try {
            const parsed = new URL(link);
            return trustedLinks.some(domain =>
                parsed.hostname.includes(domain)
            );
        } catch {
            return false;
        }
    });

    // 🧠 Cek apakah ada admin yang ditag
    const mentionedJids =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    const groupMeta = m.groupMetadata || (await bot.groupMetadata(m.chatId));
    const adminJids = groupMeta.participants
        .filter(p => p.admin !== null)
        .map(p => p.id);

    const isAdminTagged = mentionedJids.some(jid => adminJids.includes(jid));

    // ✅ Jika link aman dan tag admin, beri reaction ✅
    if (isTrusted && isAdminTagged) {
        await bot.sendMessage(m.chatId, {
            react: {
                text: "✅",
                key: m.key
            }
        });
        return;
    }

    // ❌ Jika link mencurigakan → hapus & kirim warning
    try {
        // 🧹 Hapus pesan (bot wajib admin)
        if (m.key?.id && m.key?.remoteJid) {
            await bot.sendMessage(m.chatId, {
                delete: {
                    remoteJid: m.chatId,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant || m.senderId
                }
            });
        }

        // ⚠️ Kirim peringatan via reply
        await bot.sendMessage(
            m.chatId,
            {
                text: `Whoa *@${
                    m.senderId.split("@")[0]
                },* you forgot to tag an admin! The link's been removed to keep the group safe 😎`,
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
        console.log("❌ Failed to delete or warn:", err.message);
    }
}
