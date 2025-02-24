const admin = require("firebase-admin");
const db = admin.database();

async function checkFood(chatId, bot) {
  try {
    const checkFoodRef = db.ref("checkFood");
    await checkFoodRef.set(1);

    bot.sendMessage(chatId, "Memulai pengecekan makanan...");

    checkFoodRef.on("value", async (snapshot) => {
      const value = snapshot.val();

      if (value === 0) {
        const responseRef = db.ref("checkFoodResponse");
        const responseSnapshot = await responseRef.once("value");
        const distance = responseSnapshot.val();

        const message = `Hasil pengecekan: Jarak adalah ${distance} cm`;
        bot.sendMessage(chatId, message);

        checkFoodRef.off("value");
      }
    });
  } catch (error) {
    console.error("Error:", error);
    bot.sendMessage(chatId, "Terjadi kesalahan. Silakan coba lagi.");
  }
}

module.exports = { checkFood };
