const {
	db,
	getFullState,
	getStrategyByBossId,
	upsertBossState,
	clearBossState,
} = require("./database");
require('dotenv').config()

console.log("Database connected");

const express = require("express");
const http = require("http"); // needed to create a raw HTTP server
const { Server } = require("socket.io"); // Socket.io's server class

const app = express();
const server = http.createServer(app); // wrap express in a real HTTP server
const io = new Server(server, {
	// attach Socket.io to that server
	cors: {
        origin: process.env.CLIENT_URL
    }
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

	// Send full state to the client that just connected
	const state = getFullState();
	socket.emit("full_state", state);

	// listen for a test event from any client
	socket.on("test_message", (data) => {
		console.log("Server received:", data);
		io.emit("test_message", data); // broadcast to ALL connected clients
	});

	socket.on("boss_kill", (data) => {
		const { bossId, killedAt } = data;

		// Get the strategy for this boss from the database
		const strategy = getStrategyByBossId.get(bossId);
		if (!strategy) return;

		// Calculate respawn times on the server
		let respawnAt = null;
		let respawnMinAt = null;
		let respawnMaxAt = null;

		if (strategy.respawn_type === "fixed") {
			respawnAt = killedAt + strategy.respawn_min;
		} else {
			respawnMinAt = killedAt + strategy.respawn_min;
			respawnMaxAt = killedAt + strategy.respawn_max;
		}

		// Save to database
		upsertBossState.run({
			bossId,
			killedAt,
			respawnAt,
			respawnMinAt,
			respawnMaxAt,
		});

		// Broadcast to all clients
		io.emit("boss_killed", {
			bossId,
			killedAt,
			respawnAt,
			respawnMinAt,
			respawnMaxAt,
		});
		console.log(
			`Boss ${bossId} killed at ${new Date(killedAt).toLocaleTimeString()}`,
		);
	});

	socket.on('boss_reset', (data) => {
		const { bossId } = data

		clearBossState.run(bossId)

		io.emit('boss_revived', { bossId })
		console.log(`Boss ${bossId} revived`)
	})

	socket.on("kill", (data) => {
		console.log("Boss killed:", data);
		io.emit("boss_killed", data);
	});

	socket.on("disconnect", () => {
		console.log("Someone disconnected:", socket.id);
	});
});


const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})