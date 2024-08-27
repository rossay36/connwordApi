const { User, Post } = require("../models/usersSchemas");

// @desc Get all posts
// @route GET /posts
// @access Private
const getAllPosts = async (req, res) => {
	// Get all posts from MongoDB
	const posts = await Post.find().lean();

	// If no posts
	if (!posts?.length) {
		return res.status(400).json({ message: "No posts found" });
	}

	// Add username to each post before sending the response
	// See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
	// You could also do this with a for...of loop
	const postsWithUser = await Promise.all(
		posts.map(async (post) => {
			const user = await User.findById(post.user).lean().exec();
			return {
				...post,
				username: user.username,
				profilePicture: user.profilePicture,
				coverPicture: user.coverPicture,
			};
		})
	);

	res.json(postsWithUser);
};
const createNewPost = async (req, res, next) => {
	try {
		const { user, text, image } = req.body;

		if (!user || !text) {
			return res.status(400).json({ message: "All fields are required" });
		}

		// Determine media types
		const mediaDetails = image.map((url) => ({
			url,
			type: url.endsWith(".mp4")
				? "video/mp4"
				: url.endsWith(".pdf")
				? "application/pdf"
				: "image/jpeg", // Adjust as needed
			description: "Post media",
		}));

		// Save to MongoDB
		const newPost = await Post.create({ user, text, image });

		// Update user's media array
		const userToUpdate = await User.findById(user);
		if (userToUpdate) {
			userToUpdate.media.push(...mediaDetails);
			await userToUpdate.save();
		}

		await User.findByIdAndUpdate(user, { $push: { posts: newPost._id } });

		res.status(201).json({ message: "Post created successfully", newPost });
	} catch (error) {
		console.error("Error creating post:", error);
		next(error); // Pass error to error handling middleware
	}
};

// @desc Update a post
// @route PATCH /posts
// @access Private
const updatePost = async (req, res) => {
	const { id, user, text, image } = req.body;

	// Confirm data
	if (!id || !user) {
		return res.status(400).json({ message: "All fields are required" });
	}

	if (
		req.userId === user ||
		req.roles.includes("Admin") ||
		req.roles.includes("Manager")
	) {
		// Confirm post exists to update
		const post = await Post.findById(id).exec();

		if (!post) {
			return res.status(400).json({ message: "Post not found" });
		}

		if (post)
			if (post?._id.toString() !== id) {
				// Allow renaming of the original post
				return res.status(401).json({ message: "Unauthorize" });
			}

		post.user = user;
		post.title = title;
		post.text = text;
		post.image = image;
		await post.save();

		res.json(`'${post.title}' updated`);
	} else {
		return res
			.status(409)
			.json({ message: "forbided, you can only update your post" });
	}
};

// @desc Delete a post
// @route DELETE /posts
// @access Private
const deletePost = async (req, res) => {
	const { id, user } = req.body;

	// Confirm data
	if (!id || !user) {
		return res.status(400).json({ message: "Post ID required" });
	}

	if (
		req.userId === user ||
		req.roles.includes("Admin") ||
		req.roles.includes("Manager")
	) {
		// Confirm post exists to delete
		const post = await Post.findById(id).exec();

		if (!post) {
			return res.status(400).json({ message: "Post not found" });
		}

		// Allow renaming of the original post
		if (post?._id.toString() !== id) {
			return res.status(401).json({ message: "Unauthorize" });
		}

		await post.deleteOne();

		res.status(200).json("Post Deleted");
	} else {
		return res
			.status(409)
			.json({ message: "forbided, you can only delete your post" });
	}
};

// @desc Like a post
// @route POST /posts/:postId/like
// @access Private
const likePost = async (req, res) => {
	const postId = req.params.postId;
	const userId = req.userId; // Assuming you have middleware that sets req.userId

	try {
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}

		// Check if user has already liked the post
		if (post.likes.includes(userId)) {
			return res.status(400).json({ message: "Post already liked" });
		}

		// Add user's ID to likes array
		post.likes.push(userId);
		await post.save();

		res.json(post);
	} catch (error) {
		console.error("Error liking post:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

// @desc Unlike a post
// @route POST /posts/:postId/unlike
// @access Private
const unlikePost = async (req, res) => {
	const postId = req.params.postId;
	const userId = req.userId; // Assuming you have middleware that sets req.userId

	try {
		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" }); // or handle as appropriate
		}

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}

		// Check if user has not liked the post
		if (!post.likes.includes(userId)) {
			return res.status(400).json({ message: "Post not liked yet" });
		}

		// Remove user's ID from likes array
		post.likes = post.likes.filter((id) => id.toString() !== userId);
		await post.save();

		res.json(post);
	} catch (error) {
		console.error("Error unliking post:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

module.exports = {
	getAllPosts,
	createNewPost,
	updatePost,
	deletePost,
	likePost,
	unlikePost,
};
