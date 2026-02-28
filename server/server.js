const express = require("express");
const http = require("http"); // needed to create a raw HTTP server
const { Server } = require("socket.io"); // Socket.io's server class

const app = express();
const server = http.createServer(app); // wrap express in a real HTTP server
const io = new Server(server, {
	// attach Socket.io to that server
	cors: { origin: "*" }, // allows your Vue app to connect
});

const port = 3000;

const mapsRouter = require("./routes/maps");
const bossesRouter = require("./routes/bosses");

app.use("/api/maps", mapsRouter);
app.use("/api/bosses/maps", bossesRouter);
app.use("/", (req, res) => {
	res.status(200).json({ message: "Welcome to the Folkvang Timer API!" });
});

// this runs every time a browser connects
io.on("connection", (socket) => {
	console.log("Someone connected:", socket.id);

	// listen for a test event from any client
	socket.on("test_message", (data) => {
		console.log("Server received:", data);
		io.emit("test_message", data); // broadcast to ALL connected clients
	});

	socket.on("boss_kill", (data) => {
		console.log("Boss killed:", data);
		io.emit("boss_killed", data); // broadcast to all clients
	});

	socket.on("boss_reset", (data) => {
		console.log("Boss reset:", data);
		io.emit("boss_revived", data); // broadcast to all clients
	});

    socket.on("kill", (data) => {
		console.log("Boss killed:", data);
		io.emit("boss_killed", data); // broadcast to all clients
	});

	socket.on("disconnect", () => {
		console.log("Someone disconnected:", socket.id);
	});
});

server.listen(port, () => {
	// server.listen instead of app.listen
	console.log(`Server is running on port ${port}`);
});
