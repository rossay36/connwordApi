const { User, Post, Comment } = require("../models/usersSchemas");

// @desc Get all comments
// @route GET /comments
// @access Private
const getAllComments = async (req, res) => {
	try {
		// Get all comments from MongoDB
		const comments = await Comment.find().lean();

		// If no comments
		if (!comments?.length) {
			return res.status(400).json({ message: "No comments found" });
		}

		// Prepare an array to store processed comments
		const commentsWithUser = await Promise.all(
			comments.map(async (comment) => {
				try {
					// Fetch user associated with the comment
					const user = await User.findById(comment.user).lean().exec();
					if (!user) {
						console.error(`User not found for comment ID ${comment._id}`);
						return null;
					}

					// Fetch post associated with the comment
					const post = await Post.findById(comment.post).lean().exec();
					if (!post) {
						console.error(`Post not found for comment ID ${comment._id}`);
						return null;
					}

					// Prepare the processed comment
					const processedComment = {
						...comment,
						username: user.username,
						profilePicture: user.profilePicture,
						coverPicture: user.coverPicture,
						image: post.image || "",
						text: post.text || "",
						title: post.title || "",
						likes: post.likes || [],
					};

					return processedComment;
				} catch (error) {
					console.error(`Error processing comment ID ${comment._id}:`, error);
					return null;
				}
			})
		);

		// Filter out null comments (optional)
		const validComments = commentsWithUser.filter(
			(comment) => comment !== null
		);

		res.json(validComments);
	} catch (error) {
		console.error("Error fetching comments:", error);
		res.status(500).json({ message: "Server Error" });
	}
};
// @desc Create new comment
// @route POST /comments
// @access Private

// Controller function to create a new comment
const createNewComment = async (req, res) => {
	const { desc, commentImage, user, post, parentId } = req.body;

	// Validate data
	if (!desc || !user || !post) {
		return res
			.status(400)
			.json({ message: "Description, user, and post ID are required fields" });
	}

	try {
		// Check if the post exists
		const existingPost = await Post.findById(post);
		if (!existingPost) {
			return res.status(404).json({ message: "Post not found" });
		}

		let comment;

		// Create a new comment object
		const newComment = {
			user: user,
			desc: desc,
			commentImage: commentImage, // Ensure commentImage is correctly set to an array of URLs
			post: post,
		};

		// Determine if it's a nested comment or top-level comment
		if (!parentId) {
			// Create a top-level comment
			comment = await Comment.create(newComment);

			// Update post with new comment reference
			await Post.findByIdAndUpdate(post, { $push: { comments: comment._id } });
		} else {
			// Create a nested comment (reply)
			const parentComment = await Comment.findById(parentId);
			if (!parentComment) {
				return res.status(404).json({ message: "Parent comment not found" });
			}

			comment = await Comment.create(newComment);

			// Push the nested comment to the parent comment
			parentComment.comments.push(comment._id);
			await parentComment.save();
		}

		// Return success response
		return res.status(201).json({ message: "New comment created", comment });
	} catch (error) {
		console.error("Error creating comment:", error);
		return res.status(500).json({ message: "Server error" });
	}
};

// @desc Update a comment
// @route PATCH /comments
// @access Private
const updateComment = async (req, res) => {
	const { id, userId, desc, commentImage, post } = req.body;

	// Confirm data
	if (!id || !userId) {
		return res.status(400).json({ message: "All fields are required" });
	}

	if (
		req.userId === userId ||
		req.roles.includes("Admin") ||
		req.roles.includes("Manager")
	) {
		// Confirm comment exists to update
		const comment = await Comment.findById(id).exec();

		if (!comment) {
			return res.status(400).json({ message: "Comment not found" });
		}

		if (comment)
			if (comment?._id.toString() !== id) {
				// Allow renaming of the original comment
				return res.status(401).json({ message: "Unauthorize" });
			}

		comment.user = userId;
		comment.post = post;
		comment.desc = desc;
		comment.commentImage = commentImage;
		await comment.save();

		res.json("comment updated");
	} else {
		return res
			.status(409)
			.json({ message: "forbided, you can only update your comment" });
	}
};

// @desc Delete a comment
// @route DELETE /comments
// @access Private
const deleteComment = async (req, res) => {
	const { id, postId, userId } = req.body;

	// Confirm data
	if (!id || !postId || !userId) {
		return res.status(400).json({ message: "Comment ID and Post ID required" });
	}

	if (
		req.userId === userId ||
		req.roles.includes("Admin") ||
		req.roles.includes("Manager")
	) {
		try {
			// Confirm comment exists to delete
			const comment = await Comment.findById(id).exec();

			if (!comment) {
				return res.status(400).json({ message: "Comment not found" });
			}

			// Check if the comment belongs to the specified postId
			if (comment.post.toString() !== postId) {
				return res.status(401).json({ message: "Unauthorized" });
			}

			await comment.deleteOne();

			res.status(200).json("Comment deleted");
		} catch (error) {
			console.error("Error deleting comment:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	} else {
		return res
			.status(403)
			.json({ message: "Forbidden, you can only delete your comment" });
	}
};

module.exports = {
	getAllComments,
	createNewComment,
	updateComment,
	deleteComment,
};
