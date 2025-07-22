// =======================
// 🧼 ANTI BADWORD SYSTEM
// =======================

const badwords = [
    // Indonesia
    "kontol",
    "memek",
    "bangsat",
    "anjing",
    "goblok",
    "tolol",
    "ngentot",
    "babi",
    "tai",
    "sinting",
    "idiot",
    "lonte",
    "pelacur",
    "jembut",
    "kampret",
    "bego",
    "brengsek",
    "dasar",
    "otak udang",
    // Global
    "nigga",
    "nigger",
    "hitler",
    "nazis",
    "fascist",
    "slave",
    "jew",
    "zionist",
    "kkk",
    "retard",
    "retarded",
    "tranny",
    "fag",
    "faggot",
    "dyke",
    "negro",
    "chink",
    "gook",
    "paki",
    "whore",
    "slut",
    "hoe",
    "homo",
    // English
    "fuck",
    "shit",
    "bitch",
    "asshole",
    "bastard",
    "dick",
    "pussy",
    "cunt",
    "motherfucker",
    "son of a bitch",
    "jerk",
    "moron",
    "screw you",
    "crap",
    "twat",
    "bollocks",
    "prick",
    "wanker",
    "loser",
    "scumbag",
    // Spanish, French, German, Arabic...
    "puta",
    "puto",
    "coño",
    "pendejo",
    "mierda",
    "putain",
    "connard",
    "salope",
    "scheisse",
    "arschloch",
    "fotze",
    "sharmouta",
    "khara"
];

const wordRegex = new RegExp(`\\b(${badwords.join("|")})\\b`, "i");

/**
 * Deteksi dan hapus pesan kasar lalu reply seperti command
 * @param {import('@whiskeysockets/baileys').WASocket} bot
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} m
 */
export default async function antiBadword(bot, m) {
    if (!m.isGroup || !m.text) return;
    const text = m.text.toLowerCase();
    const found = wordRegex.test(text);
    if (!found) return;

    try {
        // Hapus pesan kasar
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

        // 5% kemungkinan warning panjang
        const useLongWarning = Math.random() < 0.05;

        const shortWarnings = [
            `@${
                m.senderId.split("@")[0]
            }, watch your mouth bro. Chill out, not wild out 😎`,
            `@${
                m.senderId.split("@")[0]
            }, I'm sorry, this is for the sake of a clean group environment, I hope you understand 😄`,
            `@${m.senderId.split("@")[0]}, language! Not the sailor one 😅`,
            `@${m.senderId.split("@")[0]}, let's keep it clean in here 🚫🧼`,
            `@${m.senderId.split("@")[0]}, your mouth needs a timeout 🫢`,
            `@${
                m.senderId.split("@")[0]
            }, take a breath and use nicer words bro 🤙`,
            `@${m.senderId.split("@")[0]}, don't make the bot go wild 😤`
        ];

        const warningText = useLongWarning
            ? `😬 @${m.senderId.split("@")[0]}, whoa there buddy...

I get it, sometimes emotions run high and words just slip out. We've all been there. But let's try to keep things respectful and chill in here, yeah? We're a community, not a fight club. 😅

Take a deep breath, grab some water, and maybe type "lol" instead next time. Trust me, it works wonders.

We're all here to vibe, not to vibe-check each other. Let's not make grandma leave the group again. 🙃`
            : shortWarnings[Math.floor(Math.random() * shortWarnings.length)];

        // Kirim reply gaya status
        await bot.sendMessage(
            m.chatId,
            {
                text: warningText,
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
        console.log("❌ Gagal hapus pesan kasar:", err.message);
    }
}
