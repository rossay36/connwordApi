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
			return { ...post, username: user.username };
		})
	);

	res.json(postsWithUser);
};

// @desc Create new post
// @route POST /posts
// @access Private
const createNewPost = async (req, res) => {
	const { user, title, text, image } = req.body;

	// Confirm data
	if (!user || !title) {
		return res.status(400).json({ message: "All fields are required" });
	}

	if (req.userId === user) {
		// Create and store the new user
		const post = await Post.create({ user, title, text, image });

		if (post) {
			// Created
			return res.status(201).json({ message: "New post created" });
		} else {
			return res.status(400).json({ message: "Invalid post data received" });
		}
	} else {
		return res
			.status(409)
			.json({ message: "forbided, you can only post on your account" });
	}
};

// @desc Update a post
// @route PATCH /posts
// @access Private
const updatePost = async (req, res) => {
	const { id, user, title, text, image } = req.body;

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

		res.status(200).json(`Post '${post.title}' with ID ${post._id} deleted`);
	} else {
		return res
			.status(409)
			.json({ message: "forbided, you can only delete your post" });
	}
};

module.exports = {
	getAllPosts,
	createNewPost,
	updatePost,
	deletePost,
};
