const { db } = require("../config/firebase");
const schedule = require("node-schedule");
const { feedNow } = require("./feedingSchedule");
const { checkCameraStatus } = require("./checkCamera");

/**
 * Menjadwalkan pekerjaan pemberian pakan berdasarkan jadwal.
 * @param {number} index - Nomor jadwal (1-4).
 * @param {string} time - Waktu dalam format "HH:mm".
 * @param {number} duration - Durasi servo berputar (detik).
 */
async function scheduleFeeding(index, time, duration, chatId, bot) {
  const [hour, minute] = time.split(":").map(Number);

  schedule.scheduleJob(`feedingJob${index}`, { hour, minute }, async () => {
      console.log(`Menjalankan jadwal pemberian pakan ${index} pada waktu ${time}`);
      await feedingSchema(chatId, bot);
  });
}

async function feedingSchema(chatId, bot) {
  await checkCameraStatus(chatId, bot);

  // Cek hasil dari machine learning
  const approval = await getApprovalStatus(chatId, bot);
  if (approval === 1) {
      await processFeeding(chatId, bot);
  } else {
      // Minta persetujuan user jika approval ML == 2
      await askUserApproval(chatId, bot);
  }
}

async function feedNowSchema(duration,chatId, bot) {
  await checkCameraStatus(chatId, bot);

  // Cek hasil dari machine learning
  const approval = await getApprovalStatus(chatId, bot);
  if (approval === 1) {
      await feedNow(duration,chatId, bot);
  } else {
      // Minta persetujuan user jika approval ML == 2
      await askUserApprovalNow(duration,chatId, bot);
  }
}
/**
 * Memuat dan menjadwalkan semua jadwal yang tersimpan di Firebase.
 */
async function loadAndScheduleAllFeedings(chatId, bot) {
    try {
        const ref = db.ref("feedingSchedule");
        const snapshot = await ref.once("value");
        const schedules = snapshot.val();

        if (schedules) {
            Object.entries(schedules).forEach(([key, schedule], index) => {
                scheduleFeeding(index + 1, schedule.time, schedule.duration, chatId, bot);
            });
        }
    } catch (error) {
        console.error("Error memuat dan menjadwalkan jadwal pemberian pakan:", error);
    }
}

// Fungsi Modular



//approval dilakukan oleh ML
async function getApprovalStatus(chatId, bot) {
  bot.sendMessage(chatId, "Mengecek hasil machine learning...");

  const approvalRef = db.ref("approval");
  const snapshot = await approvalRef.once("value");
  const approval = snapshot.val();

  if (approval === 1) {
      bot.sendMessage(chatId, "Hasil machine learning: Tidak ada makanan di kolam");
  } else if (approval === 0) {
      bot.sendMessage(chatId, "Hasil machine learning: Masih ada makanan di kolam");
  } else {
      bot.sendMessage(chatId, "Hasil machine learning tidak valid.");
  }

  return approval;
}

async function askUserApprovalNow(duration,chatId, bot) {
  return new Promise((resolve) => {
      bot.sendMessage(chatId, "Apakah Anda ingin melanjutkan pemberian pakan? Ketik /yes untuk melanjutkan atau /no untuk membatalkan.");

      bot.once("message", async (msg) => {
          if (msg.text.toLowerCase() === "/yes") {
              await feedNow(duration,chatId, bot);
              resolve();
          } else if (msg.text.toLowerCase() === "/no") {
              bot.sendMessage(chatId, "Pemberian pakan dibatalkan.");
              resolve();
          }
      });
  });
}

async function askUserApproval(chatId, bot) {
    return new Promise((resolve) => {
        bot.sendMessage(chatId, "Apakah Anda ingin melanjutkan pemberian pakan? Ketik /yes untuk melanjutkan atau /no untuk membatalkan.");

        bot.once("message", async (msg) => {
            if (msg.text.toLowerCase() === "/yes") {
                await processFeeding(chatId, bot);
                resolve();
            } else if (msg.text.toLowerCase() === "/no") {
                bot.sendMessage(chatId, "Pemberian pakan dibatalkan.");
                resolve();
            }
        });
    });
}

async function processFeeding(chatId, bot) {
    const durationRef = db.ref("feedingSchedule");
    const durationSnapshot = await durationRef.once("value");
    const schedules = durationSnapshot.val();

    for (const schedule of Object.values(schedules)) {
        await feedNow(schedule.duration, chatId, bot);
    }
}

async function checkCameraSchema(chatId, bot) {
  await checkCameraStatus(chatId, bot);
  bot.sendMessage(chatId, "Kamera telah diperiksa.");
  const approval = await getApprovalStatus(chatId, bot);

}
module.exports = { loadAndScheduleAllFeedings,feedNowSchema,getApprovalStatus,checkCameraSchema };
