const { db } = require("../config/firebase"); // Impor konfigurasi Firebase

/**
 * Menyimpan pesan dari Telegram ke Firebase. INI CUMA TES
 * @param {Object} msg - Objek pesan dari Telegram.
 */
async function saveMessage(msg) {
  const ref = db.ref("message");
  const { text, from } = msg;
  const username = from.username || "Anonymous";

  try {
    // Menulis pesan ke Firebase
    await ref.set({
      user: username,
      text: text,
      timestamp: Date.now(),
    });
    return `Pesan "${text}" berhasil disimpan ke Firebase oleh ${username}!`;
  } catch (error) {
    console.error("Error menyimpan pesan:", error);
    throw new Error("Gagal menyimpan pesan ke Firebase.");
  }
}

module.exports = { saveMessage };
