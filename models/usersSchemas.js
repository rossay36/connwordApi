const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
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
		active: {
			type: Boolean,
			default: true,
		},
		password: {
			type: String,
			required: true,
		},
		profilePicture: {
			type: String,
			default: "",
		},
		coverPicture: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
			maxlength: 160,
		},
		friendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
		friendReceiver: [{ type: Schema.Types.ObjectId, ref: "User" }],
		friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
		followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
		following: [{ type: Schema.Types.ObjectId, ref: "User" }],
		address: {
			street: { type: String, default: "Add Street", trim: true },
			city: { type: String, default: "Add City", trim: true },
			state: { type: String, default: "Add State", trim: true },
			country: { type: String, default: "Add Country", trim: true },
			postalCode: { type: String, default: "", trim: true },
		},
		isActiveSlide: {
			type: Boolean,
			default: false,
		},
		relationship: {
			type: String,
			default: "Single",
		},
		education: {
			college: {
				type: String,
				default: "Add college",
				required: true,
				trim: true,
			},
			university: {
				type: String,
				default: "Add university",
				required: true,
				trim: true,
			},
			degree: {
				type: String,
				default: "Add Degree",
				required: true,
				trim: true,
			},
			fieldOfStudy: {
				type: String,
				default: "What did you study?",
				required: true,
				trim: true,
			},
			startYear: {
				type: Number,
				default: 0,
			},
			endYear: {
				type: Number,
				default: 0,
			},
		},

		job: {
			type: String,
			default: "What is your Job",
		},
		workAt: {
			type: String,
			default: "Where do you work",
		},
		hobbies: [
			{
				type: String,
				default: "Your Hobbies",
			},
		],
		lastPictureUpdate: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

const postSchema = new mongoose.Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
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

		likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
		comments: [
			{
				type: Schema.Types.ObjectId,
				ref: "Comment",
			},
		],
	},
	{ timestamps: true }
);

const commentSchema = new Schema(
	{
		post: {
			type: Schema.Types.ObjectId,
			ref: "Post",
			required: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		desc: {
			type: String,
			required: true,
		},
		commentImage: [
			{
				type: String,
			},
		],
		// Nested comments
		comments: [
			{
				type: Schema.Types.ObjectId,
				ref: "Comment",
			},
		],
		// Likes on comments
		likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);

module.exports = { User, Post, Comment };
