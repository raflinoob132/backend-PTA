const { db } = require("../config/firebase");

/**
 * Mengecek status aerator.
 * @returns {Promise<string>} Status aerator (nyala/mati).
 */
async function checkAerator() {
  try {
    const ref = db.ref("aerator");
    const snapshot = await ref.once("value");
    const status = snapshot.val();
    return status === 1 ? "Aerator nyala" : "Aerator mati";
  } catch (error) {
    console.error("Error mengecek aerator:", error);
    throw new Error("Gagal mengecek status aerator.");
  }
}

/**
 * Mengatur preferensi info aerator user.
 * @param {number} preference - 1 untuk aktif, 0 untuk nonaktif.
 */
async function setAeratorInfoPreference(preference) {
  try {
    const ref = db.ref("aeratorInfoPreference");
    await ref.set(preference);
    return `Notifikasi aerator ${preference === 1 ? "diaktifkan" : "dimatikan"}.`;
  } catch (error) {
    console.error("Error mengatur preferensi aerator:", error);
    throw new Error("Gagal mengatur preferensi info aerator.");
  }
}

/**
 * Mengecek preferensi info aerator user.
 * @returns {Promise<number>} 1 jika aktif, 0 jika nonaktif.
 */
async function getAeratorInfoPreference() {
  try {
    const ref = db.ref("aeratorInfoPreference");
    const snapshot = await ref.once("value");
    return snapshot.val() || 1; // Default nilai 1
  } catch (error) {
    console.error("Error membaca preferensi aerator:", error);
    throw new Error("Gagal membaca preferensi info aerator.");
  }
}

module.exports = { checkAerator, setAeratorInfoPreference, getAeratorInfoPreference };
