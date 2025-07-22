const spamDB = {}; // Penyimpanan sementara dalam memori

const maxSpam = 5;
const kickThreshold = 10;
const timeWindow = 5000; // 5 detik antar spam

export default async function antiSpam(bot, m) {
    if (!m.isGroup || m.fromMe) return;

const contentKey = m.text || m.type;
if (!contentKey) return;

    const groupId = m.chatId;
    const senderId = m.senderId;
    const now = Date.now();

    const key = `${groupId}:${senderId}`;
    const textKey = m.text || m.type;

    // Bikin quoted model 🜲FANRABOT
    const customQuoted = {
        key: {
            id: m.key.id,
            fromMe: false,
            remoteJid: "status@broadcast",
            participant: "0@s.whatsapp.net"
        },
        message: {
            conversation: "*🜲FANRABOT │ FRIENDSZONE*"
        }
    };

    if (!spamDB[key]) {
        spamDB[key] = {
            lastText: textKey,
            count: 1,
            lastTime: now,
            keys: [m.key],
            warned: false
        };
        return;
    }

    const track = spamDB[key];

    // Reset jika isi beda atau sudah lewat 5 detik
    if (track.lastText !== textKey || now - track.lastTime > timeWindow) {
        spamDB[key] = {
            lastText: textKey,
            count: 1,
            lastTime: now,
            keys: [m.key],
            warned: false
        };
        return;
    }

    // Tambah hit
    track.count++;
    track.lastTime = now;
    track.keys.push(m.key);

    // Hapus semua kalau spam > maxSpam
    if (track.count === maxSpam) {
        for (let msgKey of track.keys) {
            if (msgKey?.id && msgKey?.remoteJid) {
                await bot
                    .sendMessage(groupId, { delete: msgKey })
                    .catch(() => {});
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        if (!track.warned) {
            track.warned = true;

            await bot.sendMessage(
                groupId,
                {
                    text: `@${senderId.split("@")[0]}, please stop spamming.`,
                    mentions: [senderId]
                },
                {
                    quoted: customQuoted
                }
            );
        }
    }

    // Kick jika spam ekstrem
    if (track.count > kickThreshold) {
        const groupMeta = m.groupMetadata || (await bot.groupMetadata(groupId));
        const isAdmin = groupMeta.participants.find(
            p => p.id === senderId && p.admin !== null
        );

        if (!isAdmin) {
            await bot
                .groupParticipantsUpdate(groupId, [senderId], "remove")
                .catch(() => {});
        } else {
            // Kalau admin, cukup hapus pesannya
            for (let msgKey of track.keys) {
                if (msgKey?.id && msgKey?.remoteJid) {
                    await bot
                        .sendMessage(groupId, { delete: msgKey })
                        .catch(() => {});
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }

        // Reset jejak spam
        delete spamDB[key];
    }
}
