const games = {};

const renderBoard = board =>
    board
        .map(row =>
            row
                .map(cell => (cell === "" ? "⬜" : cell === "X" ? "❌" : "⭕"))
                .join("")
        )
        .join("\n");

const getInitialBoard = () =>
    Array(4)
        .fill(null)
        .map(() => Array(4).fill(""));

const checkWin = (board, symbol) => {
    const size = board.length;

    for (let i = 0; i < size; i++) {
        if (board[i].every(cell => cell === symbol)) return true;
        const col = board.map(row => row[i]);
        if (col.every(cell => cell === symbol)) return true;
    }

    if (board.every((row, i) => row[i] === symbol)) return true;
    if (board.every((row, i) => row[size - 1 - i] === symbol)) return true;

    return false;
};

const checkDraw = board => board.flat().every(cell => cell !== "");

export async function handler(sock, m) {
    const sender = m.key.participant || m.key.remoteJid;
    const mention =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    const id = m.key.remoteJid;
    const board = getInitialBoard();

    if (mention && mention !== sender) {
        games[id] = {
            board,
            players: [sender, mention],
            turn: sender,
            status: "PLAYING"
        };

        const teks =
            `🎮 Game Tic Tac Toe 4x4 dimulai antara @${
                sender.split("@")[0]
            } dan @${mention.split("@")[0]}!\n` +
            `Giliran @${
                sender.split("@")[0]
            } (❌). Kirim angka 1–16 untuk main.\n\n` +
            renderBoard(board);

        return await sock.sendMessage(id, {
            text: teks,
            mentions: [sender, mention]
        });
    } else {
        games[id] = {
            board,
            players: [sender],
            turn: sender,
            status: "BOT"
        };

        const teks =
            `🎮 Game dimulai!\nKamu adalah ❌. Kirim angka 1–16 untuk menandai kotak.\n\n` +
            renderBoard(board) +
            `\n\nGiliran kamu!`;

        return await sock.sendMessage(id, {
            text: teks,
            quoted: m
        });
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;

export async function handlePlayerMove(sock, m, pos) {
    const id = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const game = games[id];
    if (!game || game.status === "DONE") return;

    const index = pos - 1;
    if (index < 0 || index >= 16) return;

    const row = Math.floor(index / 4);
    const col = index % 4;

    if (game.board[row][col] !== "")
        return await sock.sendMessage(id, {
            text: `⚠️ Kotak ${pos} sudah terisi.`,
            quoted: m
        });

    const symbol = game.players[0] === sender ? "X" : "O";
    game.board[row][col] = symbol;

    if (checkWin(game.board, symbol)) {
        await sock.sendMessage(id, {
            text:
                renderBoard(game.board) +
                `\n\n🎉 @${sender.split("@")[0]} menang!`,
            mentions: [sender],
            quoted: m
        });
        game.status = "DONE";
        return;
    }

    if (checkDraw(game.board)) {
        await sock.sendMessage(id, {
            text: renderBoard(game.board) + `\n\n🤝 Permainan seri!`,
            quoted: m
        });
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
        const [bi, bj] = kosong[Math.floor(Math.random() * kosong.length)];
        game.board[bi][bj] = "O";

        if (checkWin(game.board, "O")) {
            await sock.sendMessage(id, {
                text: renderBoard(game.board) + `\n\n😢 Kamu kalah.`,
                quoted: m
            });
            game.status = "DONE";
            return;
        }

        if (checkDraw(game.board)) {
            await sock.sendMessage(id, {
                text: renderBoard(game.board) + `\n\n🤝 Permainan seri!`,
                quoted: m
            });
            game.status = "DONE";
            return;
        }

        return await sock.sendMessage(id, {
            text: renderBoard(game.board) + `\n\nGiliran kamu! (❌)`,
            quoted: m
        });
    } else {
        const next = game.players.find(p => p !== sender);
        game.turn = next;

        return await sock.sendMessage(id, {
            text:
                renderBoard(game.board) +
                `\n\nGiliran @${next.split("@")[0]} (${
                    symbol === "X" ? "⭕" : "❌"
                })`,
            mentions: [next],
            quoted: m
        });
    }
}
