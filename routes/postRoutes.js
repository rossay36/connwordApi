const express = require("express");
const router = express.Router();
const postesController = require("../controllers/postsController");
const { verifyTokens } = require("../middleware/verifytoken");

router.use(verifyTokens);

router
	.route("/")
	.get(postesController.getAllPosts)
	.post(postesController.createNewPost)
	.put(postesController.updatePost)
	.delete(postesController.deletePost);

module.exports = router;
