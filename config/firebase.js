const admin = require("firebase-admin");
const serviceAccount = require("../fir-realtimekotlin-bb7e1-firebase-adminsdk-2b194-00e11282c4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-realtimekotlin-bb7e1-default-rtdb.firebaseio.com/",
});

const db = admin.database();

module.exports = { admin, db };
