const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");
const { verifyTokens } = require("../middleware/verifytoken");

router.use(verifyTokens);

router
	.route("/")
	.get(postsController.getAllPosts)
	.post(postsController.createNewPost)
	.put(postsController.updatePost)
	.delete(postsController.deletePost);
router.post("/:postId/like", postsController.likePost);
router.post("/:postId/unlike", postsController.unlikePost);
module.exports = router;
