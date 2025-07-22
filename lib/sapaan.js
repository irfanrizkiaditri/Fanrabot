const greetings = {
    hi: [
        "Hey there! 👋",
        "Hi! How's it going?",
        "Hello! Good to see you.",
        "Hi! Ready to start something?",
        "Hi! Let’s make today great."
    ],
    hello: [
        "Hello hello! 😊",
        "Hey, what’s going on?",
        "Hello! Anything I can help with?",
        "Hello! You called?",
        "Well, hello there 👀"
    ],
    hey: [
        "Hey you!",
        "Yo! 😎",
        "Hey hey hey!",
        "Hey! Hope you're doing well.",
        "Hey! What's poppin'?"
    ],
    howdy: [
        "Howdy partner 🤠",
        "Howdy! You look ready for action.",
        "Howdy there! Yeehaw!",
        "Howdy! Bringing cowboy vibes today?"
    ],
    morning: [
        "Good morning! ☀️",
        "Rise and shine! 🌅",
        "Another day, another chance!",
        "Morning! Coffee first?",
        "Morning! You made it!"
    ],
    goodmorning: [
        "Good morning to you too! 🌞",
        "Have a bright and beautiful day!",
        "Pagi! Oh wait... wrong language? 😅",
        "Start the day with a smile 😊"
    ],
    evening: [
        "Good evening 🌆",
        "Evening! Hope today went well.",
        "Evening! Let’s slow things down now.",
        "Evening vibes only 🌃"
    ],
    night: [
        "Good night and sweet dreams 🌙",
        "Nighty night! Don't let the bugs bite 😴",
        "Rest well, you deserve it!",
        "Sleep tight, superstar!"
    ],
    gn: [
        "Good night! 😴",
        "Logging off? Sleep tight!",
        "See you in dreamland.",
        "Night! Recharge those brain cells!"
    ],
    bye: [
        "Bye! Don’t forget to blink. 👋",
        "See you later, alligator 🐊",
        "Take care! Don’t do anything I wouldn’t do 😄",
        "Bye bye! And yes, I’ll miss you."
    ],
    goodbye: [
        "Goodbye! 👋",
        "Catch you next time!",
        "Stay awesome!",
        "May your WiFi always be strong."
    ],
    see: [
        "See you soon!",
        "Until we meet again!",
        "See you later, navigator 🚀",
        "Laters!"
    ],
    cu: [
        "CU! (No, not a vitamin 😅)",
        "Catch ya later!",
        "Peace out ✌️",
        "See you when I see you!"
    ],
    yo: [
        "Yo! What’s good?",
        "Yo! Just chilling?",
        "Yo yo yoooo! 🎤",
        "Yo! You summoned me?"
    ],
    sup: [
        "Sup! Need something?",
        "Not much, you?",
        "Just vibing, you?",
        "Sup! Wanna talk about life or memes?"
    ],
    test: [
        "Test received. Beep bop. 🤖",
        "Loud and clear!",
        "You’re live!",
        "Testing 1 2 3… 4… I lost count."
    ],

    // MULTI-WORD GREETINGS
    "hi all": [
        "Hey everyone! 👋",
        "Hi all! How's it going?",
        "Hello gang!",
        "Hey folks!",
        "Group hug? Just kidding 😄"
    ],
    "hello everyone": [
        "Hello everyone! Hope you're doing great!",
        "Hey all! Let’s make this chat interesting!",
        "Hello people of the group! 😄",
        "Everyone here? Let’s gooo!"
    ],
    "hey guys": [
        "Hey guys! What’s up?",
        "Hey team! Reporting for duty?",
        "Yo guys! Anyone got snacks?",
        "Guys guys guys... what are we talking about? 😁"
    ],
    "good night everyone": [
        "Good night all! 🌙",
        "Sleep well, everyone!",
        "Catch y’all in dreamland!",
        "Night everyone! May your dreams be bug-free 💻"
    ],
    "bye all": [
        "Bye everyone! 👋",
        "Take care, y’all!",
        "Adios amigos!",
        "Bye bye, don’t forget to smile!"
    ],

    assalamualaikum: [
        "Waalaikumsalam",
        "Salam kembali",
        "Waalaikumsalam warahmatullah"
    ],
    salam: ["Waalaikumsalam", "Salam kembali!"],

    pagi: [
        "Selamat pagi!",
        "Pagi juga!",
        "Pagi, semangat ya 💪",
        "Pagi! Udah ngopi belum?"
    ],
    siang: ["Selamat siang!", "Siang juga!", "Siang, jangan lupa makan ya"],
    sore: ["Selamat sore!", "Sore juga!", "Sore! Jangan baper sore-sore 😆"],
    malam: ["Selamat malam!", "Malam juga!", "Malam. Hening banget ya?"],

    permisi: ["Iya, ada apa?", "Silakan", "Halo! Bisa kubantu?"],
    tes: [
        "Tes 1 2 3... Masuk",
        "Kedengeran kok",
        "Tes tes, kamu kenapa ngetes aku 😅"
    ],

    bro: ["Yo bro!", "Ada apa bro?", "Halo bro!"],
    sis: ["Halo sis!", "Ada apa sis?", "Hai hai sis"],

    woi: ["Woi juga 😅", "Sini sini!", "Ada apa woi?"],
    oi: ["Oi!", "Iya oi?", "Ada apa nih?"],

    ngab: ["Yo ngab!", "Ngab hadir!", "Ngab detected 👀"],
    anjay: ["Anjay detected 😆", "Wkwkwk anjay!", "Santuy bro 😁"],

    bot: [
        "Iya, aku bot. Tapi aku juga bisa bercanda 😄",
        "Jangan panggil bot dong, panggil sayang 😜",
        "Yesss, I’m your favorite bot!"
    ]
};

export default async function sapaan(bot, m) {
    if (!m.isGroup) return;

    // ❌ Jangan balas jika ini adalah reply pesan
    const isReply = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (isReply) return;

    if (typeof m.text !== "string") return;

    const text = m.text.trim().toLowerCase();

    // ✅ Cek jika isi pesan hanya 1 sapaan (tidak lebih dari 1 kata atau kalimat panjang)
    if (!Object.keys(greetings).includes(text)) return;

    const replies = greetings[text];
    const reply = replies[Math.floor(Math.random() * replies.length)];

    return bot.sendMessage(
        m.chatId,
        { text: reply },
        { quoted: m } // reply biasa
    );
}
