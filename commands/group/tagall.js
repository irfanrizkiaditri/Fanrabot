export const command = "tagall";

export async function handler(bot, m) {
    console.log("👉 .tagall command triggered by", m.senderId);

    // Must be in a group
    if (!m.isGroup) {
        return m.reply("❌ This command can only be used in group chats.");
    }

    // Fetch group metadata
    const groupMetadata = await bot.groupMetadata(m.chatId);

    // Check if sender is admin
    const senderIsAdmin = groupMetadata.participants.find(
        p =>
            p.id === m.senderId &&
            (p.admin === "admin" || p.admin === "superadmin")
    );

    if (!senderIsAdmin) {
        return m.reply("❌ Only group admins are allowed to tag all members.");
    }

    // Collect mentions
    const mentions = groupMetadata.participants.map(p => p.id);

    // Get additional text
    const extraText = m.args.join(" ").trim();
    const tagText = extraText ? `${extraText}\n\n` : "";

    // Final text with mentions
    const finalText = `${tagText}${mentions
        .map(u => `@${u.split("@")[0]}`)
        .join(" ")}`;

    // Send message with custom quoted reply
    await bot.sendMessage(
        m.chatId,
        {
            text: finalText,
            mentions
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
