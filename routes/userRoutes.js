const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const addressController = require("../controllers/addressController");
const requestController = require("../controllers/requestController");
const { verifyTokens } = require("../middleware/verifytoken");

router.use(verifyTokens);

router
	.route("/")
	.get(usersController.getAllUsers)
	.delete(usersController.deleteUser);

// updating personal details
router.put("/personal-details", addressController.updatePersonalDetails);

// updating personal details
router.put("/personal-lives", addressController.updateUserLives);

// updating personal details
router.put("/personal-address", addressController.updateUserAddress);

// updating cover picture
router.put("/cover-picture", usersController.updateCoverPicture);

// Use POST for sending a friend request
router.post("/friend-request/accept", requestController.acceptFriendRequest);

// Use DELETE for reject a friend request
router.delete("/friend-request/reject", requestController.rejectFriendRequest);

// updating personal details
router.put("/userEducation", addressController.updateEducation);

// Use POST for sending a friend request
router.delete("/unfollow", requestController.unfriendUser);

// Use POST for sending a friend request
router.post("/friend-request", requestController.sendFriendRequest);

// Use PUT for sending a friend request
router.put("/profile-picture", usersController.updateProfilePicture);

// Use DELETE (or PATCH) for cancelling a friend request
router.delete("/friend-request/cancel", requestController.cancelFriendRequest);

// Use PUT (or PATCH) for update a slide
router.put("/update-slide", usersController.updateIsActiveSlide);

module.exports = router;
