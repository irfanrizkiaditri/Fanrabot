export const command = "menu";
export async function handler(bot, m) {
    const teks = `
*╔═════『 🜲FANRABOT MENU 』*
*║*
*╠═════『 GROUP 』*
*║*\`✎ .group open [jam]\`
*║*\`✎ .group close [jam]\`    
*║*\`✎ .time\`         
*║*\`✎ .kick\`    
*║*\`✎ .ban (tag/reply)\`      
*║*\`✎ .unban (tag/reply)\`    
*║*\`✎ .cekban\`               
*║*\`✎ .hidetag [pesan]\`   
*║*
*╠═════『 GAME 』*
*║*\`✎ .gomu\`          
*║*\`✎ .profil\`
*║*\`✎ .makan\` 
*║*\`✎ .kerja\` 
*║*\`✎ .saldo\`  
*║*
*╠═════『 BISNIS 』*
*║*\`✎ .listusaha\`            
*║*\`✎ .beliusaha [nama]\`     
*║*\`✎ .bisnisku\`             
*║*\`✎ .ambilpenghasilan\`     
*║*\`✎ .belikaryawan [nama]\`  
*║*\`✎ .listkaryawan\`   
*║*
*╠═════『 BANK 』*
*║*\`✎ .tabung [jumlah]\`      
*║*\`✎ .tabunganku\`           
*║*\`✎ .pinjam [jumlah]\`      
*║*\`✎ .hutangku\`             
*║*\`✎ .bayarhutang [jumlah]\` 
*║*\`✎ .transfer [@tag]\`   
*║*
*╠═════『 GACHA 』*
*║*\`✎ .gacha\`  
*║*
*╠═════『 TOOLS 』*
*║*\`✎ .ping\`                 
*║*\`✎ .backup\`               
*║*\`✎ .owner\` 
*║*\`✎ .menuadmin\`
*║*\`✎ .help [fitur]\`
*║*
*╚═════『 🜲FANRABOT 』*
*Note:* Beberapa fitur hanya bisa digunakan admin atau owner.`;

    await bot.sendMessage(
        m.chatId,
        {
            text: teks
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
                    conversation: `*🜲FANRABOT │ ${m.pushName || "User"}*: 💬 ${
                        m.text || "No message"
                    }`
                }
            }
        }
    );
}

handler.private = false;
handler.onlyOwner = true;
handler.onlyPremium = false;
