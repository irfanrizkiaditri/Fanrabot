export const command = "kick";
export async function handler(bot, m) {
    if (!m.isGroup) {
        return await bot.sendMessage(
            m.chatId,
            {
                text: "❌ This command can only be used in groups."
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
                        conversation: `*🜲FANRABOT │ ${
                            m.pushName || "User"
                        }*: 💬 ${m.text || "No message"}`
                    }
                }
            }
        );
    }

    const groupMetadata = await bot.groupMetadata(m.chatId);
    const sender = m.senderId;
    const isAdmin = groupMetadata.participants.some(
        p => p.id === sender && p.admin
    );

    if (!isAdmin) {
        return await bot.sendMessage(
            m.chatId,
            {
                text: "❌ This command is only for group admins."
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
                        conversation: `*🜲FANRABOT │ ${
                            m.pushName || "User"
                        }*: 💬 ${m.text || "No message"}`
                    }
                }
            }
        );
    }

    const context = m.message?.extendedTextMessage?.contextInfo || {};
    const target = context.participant || context.mentionedJid?.[0];

    if (!target) {
        return await bot.sendMessage(
            m.chatId,
            {
                text: "❌ Please tag or reply to the person you want to kick."
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
                        conversation: `*🜲FANRABOT │ ${
                            m.pushName || "User"
                        }*: 💬 ${m.text || "No message"}`
                    }
                }
            }
        );
    }

    try {
        await bot.groupParticipantsUpdate(m.chatId, [target], "remove");

        const infoText = `✅ @${
            target.split("@")[0]
        } has been kicked from the group.`;

        await bot.sendMessage(
            m.chatId,
            {
                text: infoText,
                mentions: [target]
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
                        conversation: `*🜲FANRABOT │ FRIENDSZONE*`
                    }
                }
            }
        );
    } catch (err) {
        console.log("Kick Error:", err);
        await bot.sendMessage(
            m.chatId,
            {
                text: "❌ Failed to kick the user."
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
                        conversation: `*🜲FANRABOT │ ${
                            m.pushName || "User"
                        }*: 💬 ${m.text || "No message"}`
                    }
                }
            }
        );
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
