require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { connectToDB } = require("./database");
const registerSocketHandlers = require("./sockets/socketHandlers");
const watchChanges = require("./watchers/mongoWatcher");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(express.json()); // important for parsing JSON body
app.use("/push", require("./routes/push"));

connectToDB()
  .then(() => {
    console.log("✅ Connected to MongoDB");
    watchChanges(io); // watch changes after DB is ready
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
  });

io.on("connection", (socket) => registerSocketHandlers(socket));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Socket server running at http://localhost:${PORT}`);
});
