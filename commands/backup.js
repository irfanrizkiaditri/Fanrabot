import fs from "fs";
import { spawn } from "child_process";
export const command = "backup";

export async function handler(bot, m) {
    const sender = m.senderId?.split("@")[0];
    if (sender !== "6285788918217") {
        return m.reply("❌ Hanya owner yang bisa menggunakan perintah ini.");
    }

    // Reaksi ⏳
    await bot.sendMessage(m.chatId, { react: { text: "⏳", key: m.key } });

    // Format nama zip
    const now = new Date();
    const tanggal = String(now.getDate()).padStart(2, "0");
    const bulan = String(now.getMonth() + 1).padStart(1, "0"); // bulan dimulai dari 0
    const tahun = String(now.getFullYear()).slice(2); // ambil 2 digit terakhir
    const zipName = `🜲FANRABOTv2_${tanggal}${bulan}${tahun}.zip`;

    // Jalankan proses zip (kecualikan folder)
    const zip = spawn(
        "zip",
        ["-r", zipName, ".", "-x", "node_modules/*", "session/*"],
        { cwd: process.cwd() }
    );

    zip.on("error", async () => {
        return m.reply(
            "❌ Gagal menjalankan perintah `zip`. Pastikan sudah terinstal."
        );
    });

    zip.on("close", async code => {
        if (code !== 0) return m.reply("❌ Gagal membuat file backup.");

        try {
            const file = fs.readFileSync(zipName);

            // Kirim file + tombol + reply format status
            await bot.sendMessage(
                m.chatId,
                {
                    document: file,
                    fileName: zipName,
                    mimetype: "application/zip",
                    caption: "📁 `Backup berhasil dikirim.`",
                    buttons: [
                        {
                            buttonId: "join-group",
                            buttonText: { displayText: "🔗 Join Grup" },
                            type: 1
                        }
                    ],
                    footer: "🜲FANRABOT Backup System"
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

            // Reaksi selesai ✅
            await bot.sendMessage(m.chatId, {
                react: { text: "✅", key: m.key }
            });

            // Hapus file setelah dikirim
            fs.unlinkSync(zipName);
        } catch (err) {
            return m.reply("❌ Gagal membaca atau mengirim file backup.");
        }
    });
}

handler.command = "backup";
handler.private = false;
handler.onlyOwner = true;
handler.onlyPremium = false;
