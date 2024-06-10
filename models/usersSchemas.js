const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			trim: true,
		},
		firstname: {
			type: String,
			required: true,
			trim: true,
		},
		lastname: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
		},
		roles: {
			type: [String],
			default: ["User"],
		},

		password: {
			type: String,
			required: true,
		},
		profilePicture: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
			maxlength: 160,
		},
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		coverPicture: {
			type: String,
			default: "",
		},
		address: {
			street: {
				type: String,
				default: "",
				trim: true,
			},
			city: {
				type: String,
				default: "",
				trim: true,
			},
			state: {
				type: String,
				default: "",
				trim: true,
			},
			country: {
				type: String,
				default: "",
				trim: true,
			},
			postalCode: {
				type: String,
				default: "",
				trim: true,
			},
		},
		education: [
			{
				school: {
					type: String,
					required: true,
					trim: true,
				},
				degree: {
					type: String,
					required: true,
					trim: true,
				},
				fieldOfStudy: {
					type: String,
					required: true,
					trim: true,
				},
				startYear: {
					type: Number,
				},
				endYear: {
					type: Number,
				},
			},
		],
	},
	{ timestamps: true }
);

const postSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: {
			type: String,
		},
		text: {
			type: String,
			required: true,
		},
		image: [
			{
				type: String,
			},
		],
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		comments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Comment",
			},
		],
	},
	{ timestamps: true }
);

const commentSchema = new mongoose.Schema(
	{
		post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);

module.exports = { User, Post, Comment };
