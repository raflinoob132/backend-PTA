const { db } = require("../config/firebase");
//const { getApprovalStatus } = require("./itsFeedingTime");

async function checkCameraStatus(chatId, bot) {
    const cameraRef = db.ref("cekkamera");

    // Kirim nilai 1 ke kolom /cekkamera
    await cameraRef.set(1);
    console.log("Nilai 1 telah dikirim ke kolom /cekkamera");

    return new Promise((resolve) => {
        cameraRef.on("value", (snapshot) => {
            const value = snapshot.val();
            console.log(`Nilai cekkamera diperbarui menjadi: ${value}`);
            if (value === 0) {
                console.log("Nilai cekkamera kembali menjadi 0.");
                cameraRef.off("value");
                resolve();
            }
        });
    });
}



module.exports = {checkCameraStatus };