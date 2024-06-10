const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { verifyTokens } = require("../middleware/verifytoken");

router.use(verifyTokens);

router
	.route("/")
	.get(usersController.getAllUsers)
	.put(usersController.updateUser)
	.delete(usersController.deleteUser);

module.exports = router;
