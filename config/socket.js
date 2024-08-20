// config/socket.js
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const { User } = require("../models/usersSchemas"); // Import User model

const initializeSocket = (server) => {
	const io = socketIo(server, {
		cors: {
			origin: "http://localhost:5173", // Adjust to your client's URL
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.query.token;
			if (token) {
				jwt.verify(
					token,
					process.env.ACCESS_TOKEN_SECRET,
					async (err, decoded) => {
						if (err) {
							return next(new Error("Authentication error"));
						}
						const user = await User.findById(decoded.UserInfo.userId).exec();
						if (!user) {
							return next(new Error("User not found"));
						}
						socket.user = user; // Attach user details to socket
						next();
					}
				);
			} else {
				next(new Error("Authentication error"));
			}
		} catch (err) {
			next(new Error("Authentication error"));
		}
	});

	io.on("connection", (socket) => {
		console.log("A user connected");
		socket.on("sendMessage", (message) => {
			io.emit("message", message);
		});
		socket.on("disconnect", () => {
			console.log("User disconnected");
		});
	});
};

module.exports = { initializeSocket };
