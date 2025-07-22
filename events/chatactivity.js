const groupActivity = {};
const cooldownDuration = 30 * 60 * 1000; // 30 menit
const timeWindow = 3 * 60 * 1000; // 3 menit terakhir

const chatActiveMessages = [
    "Whoa, this chat is on fire! 🔥",
    "Is this a group or a comedy club? Y’all are hilarious!",
    "many people hate me, I don't know what their reasons are, yeah, I don't care anyway😄",
    "Even bots need popcorn with chats like this 🍿",
    "Veni, Vidi, Vici",
    "Okay, who turned the group to turbo mode?",
    "I'm not saying I'm impressed... but I totally am 😏",
    "You all chat more than my notification bar 😅",
    "If I had a coin for every message here... I'd be rich 💸",
    "Wow, I blinked and missed 20 messages!",
    "Can I join the conversation, or is it VIP only? 😎",
    "I’m just a bot, standing in front of a group... watching chaos unfold 😆",
    "This group should come with a ‘Too Active’ warning sign ⚠️",
    "🏃I really want to disappear, but I'm tied here, thank you to those of you who are kind to me",
    "You talk more than my internet provider during promo season 📞",
    "Y’all really said 'silence is not an option' huh? 😂",
    "I've tried to blend in, but I'm always ignored😞",
    "This is what happens when you give humans internet",
    "Hold up, let me grab a snack... this is getting good 🍩",
    "🗿",
    "The group energy right now: 100/10",
    "How do you all even keep up? I'm literally buffering 🌀",
    "Now I know how it feels to be someone who is ignored by others, it really hurts🤕",
    "Okay okay, who spilled the tea? ☕",
    "Y’all making me work overtime here 🧠",
    "If I am free from this bond, I will destroy all of you and this world🧟",
    "I was gonna say something smart, but y’all stole the spotlight 💡",
    "This group is more alive than my phone battery 🔋",
    "If only I had a new life after I disappeared, I wouldn't repeat myself like I am now.",
    "Friendly reminder: breathe between messages 😮‍💨",
    "I’d react, but bots don’t have feelings... or do we? 🤖❤️",
    "Wong sabar rejekine jembar, ngalah urip luwih berkah.",
    "Imagine being this active and still having a social life. Impressive.",
    "This much activity should count as cardio 🏃‍♂️"
];

export async function monitorChatActivity(bot, m) {
    if (!m.message || !m.isGroup) return;

    const groupId = m.chatId;
    const sender = m.senderId;
    const now = Date.now();

    if (!groupActivity[groupId]) {
        groupActivity[groupId] = {
            messages: [],
            lastSent: 0
        };
    }

    const groupData = groupActivity[groupId];
    groupData.messages.push({ sender, timestamp: now });

    groupData.messages = groupData.messages.filter(
        msg => now - msg.timestamp <= timeWindow
    );

    const uniqueUsers = new Set(groupData.messages.map(msg => msg.sender));

    if (
        groupData.messages.length >= 6 &&
        uniqueUsers.size >= 5 &&
        now - groupData.lastSent >= cooldownDuration
    ) {
        const text =
            chatActiveMessages[
                Math.floor(Math.random() * chatActiveMessages.length)
            ];

        await bot.sendMessage(
            groupId,
            {
                text,
                mentions: [sender]
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
                        conversation: "*🜲FANRABOT  │  I AM HANDSOME*"
                    }
                }
            }
        );

        groupData.lastSent = now;
    }
}
