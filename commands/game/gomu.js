export const command = "gomu";
const games = {};

const renderBoard = board =>
    board
        .map(row =>
            row
                .map(cell => (cell === "" ? "⬜" : cell === "X" ? "❌" : "⭕"))
                .join("")
        )
        .join("\n");

const getInitialBoard = (size = 4) =>
    Array(size)
        .fill(null)
        .map(() => Array(size).fill(""));

const checkWin = (board, symbol) => {
    const size = board.length;
    const winLength = size === 4 ? 4 : size === 6 ? 5 : 6;

    const inBounds = (x, y) => x >= 0 && y >= 0 && x < size && y < size;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] !== symbol) continue;

            const directions = [
                [0, 1], // horizontal →
                [1, 0], // vertical ↓
                [1, 1], // diagonal ↘
                [1, -1] // diagonal ↙
            ];

            for (const [dx, dy] of directions) {
                let count = 0;
                for (let k = 0; k < winLength; k++) {
                    const x = i + dx * k;
                    const y = j + dy * k;
                    if (!inBounds(x, y)) break;
                    if (board[x][y] !== symbol) break;
                    count++;
                }
                if (count === winLength) return true;
            }
        }
    }

    return false;
};

const checkDraw = board => board.flat().every(cell => cell !== "");

const normalizeJid = jid => (jid.includes("@") ? jid : `${jid}@s.whatsapp.net`);

const renderBoardWithGuide = size => {
    let board = "";
    let num = 1;
    for (let i = 0; i < size; i++) {
        let row = "";
        for (let j = 0; j < size; j++) {
            row += num < 10 ? `0${num} ` : `${num} `;
            num++;
        }
        board += row.trim() + "\n";
    }
    return board.trim();
};

export async function handler(sock, m) {
    const sender = m.senderId?.split("@")[0] || m.key.participant;
    const mention =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const id = m.chatId;

    const input = (m.args?.[0] || "").toLowerCase();
    let size = 4;

    if (input === "stop" || input === "keluar") {
        if (!games[id])
            return sock.sendMessage(id, {
                text: "❌ Tidak ada game yang sedang berlangsung."
            });

        delete games[id];
        return sock.sendMessage(id, { text: "🛑 Game telah dihentikan." });
    }

    if (["easy", "4x4"].includes(input)) size = 4;
    else if (["normal", "6x6"].includes(input)) size = 6;
    else if (["hard", "8x8"].includes(input)) size = 8;
    else if (!input || input === "") {
        const teks =
            "🧠 *Pilih Level Gomu:*\n\n" +
            "• `.gomu easy` (4x4)\n" +
            "• `.gomu normal` (6x6)\n" +
            "• `.gomu hard` (8x8)\n\n" +
            "Kamu juga bisa main bareng teman: `.gomu 6x6 @teman`";
        return sock.sendMessage(
            m.chatId,
            { text: teks },
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

    const board = getInitialBoard(size);
    const total = size * size;

    if (mention && mention !== sender) {
        games[id] = {
            board,
            players: [sender, mention],
            turn: sender,
            status: "PLAYING",
            size
        };

        const teks =
            `🎮 Game Tic Tac Toe ${size}x${size} dimulai antara @$${
                sender.split("@")[0]
            } dan @${mention.split("@")[0]}!\n` +
            `Giliran @${
                sender.split("@")[0]
            } (❌). Kirim angka 1–${total} untuk main.

🪧 \`Contoh petunjuk posisi:\`
${renderBoardWithGuide(size)}\n\n` +
            renderBoard(board);

        return await sock.sendMessage(
            id,
            {
                text: teks,
                mentions: [normalizeJid(sender), normalizeJid(mention)]
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
    } else {
        games[id] = {
            board,
            players: [sender],
            turn: sender,
            status: "BOT",
            size
        };

        const teks =
            `🎮 Game dimulai! (${size}x${size})\n\`Kamu adalah: [X]\`.\nKirim angka 1–${total} untuk menandai kotak.

🪧 \`Contoh petunjuk posisi:\`
${renderBoardWithGuide(size)}\n\n` +
            renderBoard(board) +
            `\n\nGiliran kamu!`;

        return await sock.sendMessage(
            id,
            { text: teks },
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
}

export async function handlePlayerMove(sock, m, pos) {
    const id = m.chatId;
    const sender = normalizeJid(m.senderId || m.key.participant);
    const game = games[id];
    if (!game || game.status === "DONE") return;

    const size = game.size || 4;
    const total = size * size;
    const index = pos - 1;
    if (index < 0 || index >= total) return;

    const row = Math.floor(index / size);
    const col = index % size;

    if (game.board[row][col] !== "")
        return await sock.sendMessage(
            id,
            {
                text: `⚠️ Kotak ${pos} sudah terisi.`
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

    const symbol = normalizeJid(game.players[0]) === sender ? "X" : "O";
    game.board[row][col] = symbol;

    if (checkWin(game.board, symbol)) {
        await sock.sendMessage(
            id,
            {
                text: `${renderBoard(game.board)}\n\n🎉 @${
                    sender.split("@")[0]
                } menang!`,
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
                        conversation: `*🜲FANRABOT │ ${
                            m.pushName || "User"
                        }*: 💬 ${m.text || "No message"}`
                    }
                }
            }
        );
        game.status = "DONE";
        return;
    }

    if (checkDraw(game.board)) {
        await sock.sendMessage(
            id,
            {
                text: `${renderBoard(game.board)}\n\n🤝 Permainan seri!`
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
        game.status = "DONE";
        return;
    }

    if (game.status === "BOT") {
        const kosong = [];
        game.board.forEach((row, i) =>
            row.forEach((cell, j) => {
                if (cell === "") kosong.push([i, j]);
            })
        );

        let bestMove = null;
        for (const [i, j] of kosong) {
            const temp = game.board.map(row => [...row]);
            temp[i][j] = "O";
            if (checkWin(temp, "O")) {
                bestMove = [i, j];
                break;
            }
        }

        if (!bestMove) {
            for (const [i, j] of kosong) {
                const temp = game.board.map(row => [...row]);
                temp[i][j] = "X";
                if (checkWin(temp, "X")) {
                    bestMove = [i, j];
                    break;
                }
            }
        }

        if (!bestMove) {
            bestMove = kosong[Math.floor(Math.random() * kosong.length)];
        }

        const [bi, bj] = bestMove;
        game.board[bi][bj] = "O";

        if (checkWin(game.board, "O")) {
            await sock.sendMessage(
                id,
                {
                    text: `${renderBoard(game.board)}\n\n😢 Kamu kalah.`
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
            game.status = "DONE";
            return;
        }

        if (checkDraw(game.board)) {
            await sock.sendMessage(
                id,
                {
                    text: `${renderBoard(game.board)}\n\n🤝 Permainan seri!`
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
            game.status = "DONE";
            return;
        }

        return await sock.sendMessage(
            id,
            {
                text: `${renderBoard(game.board)}\n\nGiliran kamu! (❌)`
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
    } else {
        const next = game.players.find(p => normalizeJid(p) !== sender);
        game.turn = next;

        return await sock.sendMessage(
            id,
            {
                text: `${renderBoard(game.board)}\n\nGiliran @${
                    next.split("@")[0]
                } (${symbol === "X" ? "⭕" : "❌"})`,
                mentions: [normalizeJid(next)]
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
}

handler.command = "gomu";
handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
