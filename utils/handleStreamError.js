const { connectToDB } = require("../database");

module.exports = async function handleChangeStreamError(err, io) {
  console.error("⚠️ Change Stream Error:", err);
  try {
    await connectToDB();
    console.log("🔁 Reconnected to MongoDB, retrying Change Stream...");
    setTimeout(() => require("../watchers/mongoWatcher")(io), 3000);
  } catch (reconnectErr) {
    console.error("Failed to reconnect:", reconnectErr);
  }
};
