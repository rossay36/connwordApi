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

module.exports = {
	verifyTokens,
};
