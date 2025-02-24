const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const { db } = require("./config/firebase"); // Impor konfigurasi Firebase
const { checkFood } = require("./functions/foodChecker"); // Impor fungsi checkFood
const { saveMessage } = require("./functions/saveMessage"); // Impor fungsi saveMessage
const { setSchedule, feedNow, deleteSchedule, getSchedule } = require("./functions/feedingSchedule");
const {
    checkAerator,
    setAeratorInfoPreference,
    getAeratorInfoPreference,
  } = require("./functions/aeratorChecker");
  
  const { loadAndScheduleAllFeedings,feedNowSchema,checkCameraSchema} = require("./functions/itsFeedingTime");
  const { checkCameraStatus} = require("./functions/checkCamera");
  // Variable untuk mencegah spam notifikasi
let aeratorNotificationTimer = null;
// Inisialisasi Bot Telegram
const TELEGRAM_TOKEN = "7427324362:AAGerepPrfH4k7L2wKhvhFsgtxd_l8KGo2w";
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Inisialisasi Express
const app = express();
app.use(bodyParser.json());

// Endpoint untuk mengecek server
app.get("/", (req, res) => {
  res.send("Server is running!");
});


//loadAndScheduleAllFeedings();

  async function monitorAerator(chatId, bot) {
    try {
      const preference = await getAeratorInfoPreference();
      if (preference === 1) {
        const ref = db.ref("aerator");
        const snapshot = await ref.once("value");
        const status = snapshot.val();
  
        if (status === 0) {
          bot.sendMessage(chatId, "Peringatan: Aerator mati!");
        }
      }
    } catch (error) {
      console.error("Error saat memantau aerator:", error);
    }
  }
  
  // Jalankan monitoring aerator setiap 30 detik
  setInterval(() => {
    if (aeratorNotificationTimer) {
      monitorAerator(aeratorNotificationTimer.chatId, aeratorNotificationTimer.bot);
    }
  }, 10000);
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
  
    try {
      const [command, ...args] = text.split(" ");
      if (text === "/loadjadwal") {
        try {
          await loadAndScheduleAllFeedings(chatId, bot);
          bot.sendMessage(chatId, "Semua jadwal pemberian pakan telah dimuat dan dijadwalkan.");
        } catch (error) {
          bot.sendMessage(chatId, `Terjadi kesalahan saat memuat jadwal: ${error.message}`);
        }
      }
    if (command === "/cekaerator") {
        const status = await checkAerator(chatId,bot);
        bot.sendMessage(chatId, `Status aerator: ${status}`);
      } else if (command === "/infoaerator") {
        const [preference] = args;
        if (!preference || (preference !== "1" && preference !== "0")) {
          return bot.sendMessage(
            chatId,
            "Format salah. Gunakan: /infoaerator {1 untuk aktif, 0 untuk nonaktif}"
          );
        }
        const response = await setAeratorInfoPreference(parseInt(preference));
        bot.sendMessage(chatId, response);
  
        // Atur ulang monitoring jika preferensi diaktifkan atau dinonaktifkan
        if (preference === "1") {
          aeratorNotificationTimer = { chatId, bot };
        } else {
          aeratorNotificationTimer = null;
        }
      } 
      else if (command === "/checkFood") {
        await checkFood(chatId, bot);}
      
      else if (command === "/jadwal") {
        const [index, time, duration] = args;
        if (!index || !time || !duration || isNaN(parseInt(index)) || isNaN(parseInt(duration))) {
          return bot.sendMessage(chatId, "Format salah. Gunakan: /jadwal {ke berapa} {HH:mm} {durasi}");
        }
        const response = await setSchedule(parseInt(index), time, parseInt(duration));
        bot.sendMessage(chatId, response);
      } else if (command === "/hapusjadwal") {
        const [index] = args;
        if (!index || isNaN(parseInt(index))) {
          return bot.sendMessage(chatId, "Format salah. Gunakan: /hapusjadwal {ke berapa}");
        }
        const response = await deleteSchedule(parseInt(index));
        bot.sendMessage(chatId, response);
      } else if (command === "/berisekarang") {
        const [duration] = args;
        if (!duration || isNaN(parseInt(duration))) {
          return bot.sendMessage(chatId, "Format salah. Gunakan: /berisekarang {durasi}");
        }
        await feedNowSchema(parseInt(duration),chatId,bot);
        //const response = 
        //bot.sendMessage(chatId, response);
      }
      else if (command === "/cekkamera") {
        await checkCameraSchema(chatId, bot);}
      else if (command === "/cekjadwal") {
        const schedules = await getSchedule();
        if (typeof schedules === "string") {
          bot.sendMessage(chatId, schedules);
        } else {
          let message = "Jadwal Pakan:\n";
          Object.entries(schedules).forEach(([key, value], index) => {
            message += `${index + 1}. ${key} - Waktu: ${value.time}, Durasi: ${value.duration} detik\n`;
          });
          bot.sendMessage(chatId, message);
        }
      } else {
        const responseMessage = await saveMessage(msg);
        bot.sendMessage(chatId, responseMessage);
      }
    } catch (error) {
      console.error("Error:", error);
      bot.sendMessage(chatId, `Terjadi kesalahan: ${error.message}`);
    }
  
  });

// Jalankan server Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//  else if (command === "/jadwal1" || command === "/jadwalkex") {
      //   const [time, duration] = args;
      //   if (!time || !duration || isNaN(parseInt(duration))) {
      //     return bot.sendMessage(chatId, "Format salah. Gunakan: /jadwal1 HH:mm durasi");
      //   }
      //   const response = await setSchedule(command.substring(1), time, parseInt(duration));
      //   bot.sendMessage(chatId, response);}
