const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: "/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-conversation", (conversationId) => {
      if (!conversationId) {
        socket.emit("error", { message: "Invalid conversation ID" });
        return;
      }
      console.log(`Client ${socket.id} joining conversation:`, conversationId);
      socket.join(conversationId);
    });

    socket.on("leave-conversation", (conversationId) => {
      if (!conversationId) {
        socket.emit("error", { message: "Invalid conversation ID" });
        return;
      }
      console.log(`Client ${socket.id} leaving conversation:`, conversationId);
      socket.leave(conversationId);
    });

    socket.on("send-message", (data) => {
      try {
        if (!data.conversationId || !data.message || !data.senderId) {
          socket.emit("error", { message: "Invalid message data" });
          return;
        }

        console.log("Message received:", data);
        const message = {
          id: Date.now().toString(),
          conversation: { id: data.conversationId },
          sender: { id: data.senderId },
          message: data.message,
          date_created: new Date().toISOString(),
        };
        io.to(data.conversationId).emit("new-message", message);
      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("error", { message: "Internal server error" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
