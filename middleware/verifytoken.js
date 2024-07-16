// authMiddleware.js

const jwt = require("jsonwebtoken");

const verifyTokens = (req, res, next) => {
	const authHeader = req.headers.authorization || req.headers.Authorization;

	if (!authHeader?.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const token = authHeader.split(" ")[1];

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err) {
			return res
				.status(403)
				.json({ message: "Forbidden, expired or tampered data" });
		}
		req.user = decoded.UserInfo.username;
		req.roles = decoded.UserInfo.roles;
		req.userId = decoded.UserInfo.userId;
		next();
	});
};

const userSpecificMiddleware = (req, res, next) => {
	if (req.userId !== id) {
		return res
			.status(409)
			.json({ message: "Forbidden, you can only update your account" });
	}
	// Additional logic specific to user, admin, and manager
	// ...
	next();
};

const adminManagerMiddleware = (req, res, next) => {
	// Check if the user is an admin or manager
	if (req.roles.includes("admin") || req.roles.includes("manager")) {
		// Additional logic specific to admin and manager
		// ...
		next();
	} else {
		return res
			.status(403)
			.json({ message: "Forbidden, only admin and manager can access" });
	}
};

module.exports = {
	verifyTokens,
	userSpecificMiddleware,
	adminManagerMiddleware,
};
