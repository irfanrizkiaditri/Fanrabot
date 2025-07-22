const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const joinQueue = {}; // Untuk menyimpan member baru

export default async function welcomeHandler(bot, update) {
    const { id: groupId, participants, action } = update;

    if (action !== "add") return; // Hanya respon jika ada yang join

    if (!joinQueue[groupId]) {
        joinQueue[groupId] = [];

        setTimeout(async () => {
            const mentions = joinQueue[groupId].map(p => p.id);
            const usernames = mentions
                .map(p => "@" + p.split("@")[0])
                .join(" ");

            const message = `\`Yo Welcome to the group!\` 👋\n${usernames}\n\nLet's keep it chill and respectful. Please read the rules before joining the conversation. And, just a heads up, I'm pretty dashing 😎🔥`;

            await bot.sendMessage(
                groupId,
                {
                    text: message,
                    mentions
                },
                {
                    quoted: {
                        key: {
                            id: "🜲FANRABOT-WELCOME",
                            fromMe: false,
                            remoteJid: "status@broadcast",
                            participant: "0@s.whatsapp.net"
                        },
                        message: {
                            conversation: `*🜲FANRABOT │ FRIENDSZONE*`
                        }
                    }
                }
            );

            delete joinQueue[groupId];
        }, 30_000);
    }

    for (let user of participants) {
        if (!joinQueue[groupId].some(u => u.id === user)) {
            joinQueue[groupId].push({ id: user });
        }
    }
}
