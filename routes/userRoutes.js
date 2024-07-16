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
router.put("/cover", usersController.updateCoverPicture);
router.put("/profile", usersController.updateProfilePicture);
router.put("/update-slide", usersController.updateIsActiveSlide);
router.post("/friend-request", usersController.sendFriendRequest);
router.post("/friend-request/accept", usersController.acceptFriendRequest);
router.post("/friend-request/reject", usersController.rejectFriendRequest);
router.post("/friend-request/cancel", usersController.cancelFriendRequest);
router.post("/unfollow", usersController.unfriendUser);

module.exports = router;
