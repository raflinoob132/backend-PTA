const { db } = require("../config/firebase");
const { checkFood } = require("./foodChecker");
/**
 * Menyimpan atau memperbarui jadwal pemberian pakan.
 * @param {number} index - Nomor jadwal (1-4).
 * @param {string} time - Waktu dalam format "HH:mm".
 * @param {number} duration - Durasi servo berputar (detik).
 */
async function setSchedule(index, time, duration) {
  if (index < 1 || index > 4) {
    throw new Error("Nomor jadwal harus antara 1 hingga 4.");
  }
  const key = `jadwal${index}`;
  try {
    const ref = db.ref(`feedingSchedule/${key}`);
    await ref.set({ time, duration });
    return `Jadwal ${key} berhasil disimpan: pukul ${time}, durasi ${duration} detik.`;
  } catch (error) {
    console.error("Error menyimpan jadwal:", error);
    throw new Error("Gagal menyimpan jadwal ke Firebase.");
  }
}

/**
 * Menjalankan pemberian pakan langsung.
 * @param {number} duration - Durasi servo berputar (detik).
 */
async function feedNow(duration,chatID,bot) {
  const statusRef = db.ref("feedingActions/status");
  const durationRef = db.ref("feedingActions/berisekarang");
  try {
    const statusSnapshot = await statusRef.once("value");
    const status = statusSnapshot.val();
    if (status === 1) {
      throw new Error("Pakan sedang dalam proses pemberian. Tunggu sampai selesai.");
    }
    console.log("Memberi pakan selama ", duration," s")
    // Set status ke 1 untuk memulai proses
    await durationRef.set(duration);
    await statusRef.set(1);
    await checkFood(chatID,bot);
    const message = `Pakan diberikan selama ${duration} detik.`;
    bot.sendMessage(chatID, message);
    //return `Pakan diberikan selama ${duration} detik.`;
  } catch (error) {
    console.error("Error memberi pakan:", error);
    throw new Error("Gagal memberi pakan sekarang.");
  }
}

/**
 * Menghapus jadwal pemberian pakan berdasarkan nomor.
 * @param {number} index - Nomor jadwal yang akan dihapus (1-4).
 */
async function deleteSchedule(index) {
  if (index < 1 || index > 4) {
    throw new Error("Nomor jadwal harus antara 1 hingga 4.");
  }
  const key = `jadwal${index}`;
  try {
    const ref = db.ref(`feedingSchedule/${key}`);
    await ref.remove();
    return `Jadwal ${key} berhasil dihapus.`;
  } catch (error) {
    console.error("Error menghapus jadwal:", error);
    throw new Error("Gagal menghapus jadwal dari Firebase.");
  }
}

/**
 * Mendapatkan semua jadwal pemberian pakan.
 */
async function getSchedule() {
  try {
    const ref = db.ref("feedingSchedule");
    const snapshot = await ref.once("value");
    const schedules = snapshot.val();
    if (schedules) {
      return schedules;
    } else {
      return "Tidak ada jadwal pakan yang ditemukan.";
    }
  } catch (error) {
    console.error("Error membaca jadwal:", error);
    throw new Error("Gagal membaca jadwal dari Firebase.");
  }
}
//loadAndScheduleAllFeedings();

module.exports = { setSchedule, feedNow, deleteSchedule, getSchedule };
