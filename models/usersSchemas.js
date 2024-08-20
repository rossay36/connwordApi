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
		contacts: {
			emailAdress: [{ type: String, trim: true }],
			facebookAdress: [{ type: String, trim: true }],
			instagramAdress: [{ type: String, trim: true }],
			xAdress: [{ type: String, trim: true }],
			linkedInAdress: [{ type: String, trim: true }],
			phoneAdress: [{ type: String, trim: true }],
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
		gender: {
			type: String,
			enum: [
				"Male",
				"Female",
				"Non-binary",
				"Genderqueer",
				"Genderfluid",
				"Agender",
				"Bigender",
				"Other",
			],
			default: "",
			required: true,
		},
		posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
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
		lives: {
			currentStreet: { type: String, default: "Add CurrentStreet", trim: true },
			currentCity: { type: String, default: "Add CurrentCity", trim: true },
			currentState: { type: String, default: "Add CurrentState", trim: true },
			currentCountry: {
				type: String,
				default: "Add CurrentCountry",
				trim: true,
			},
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

// Message Schema
const messageSchema = new Schema(
	{
		sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
		recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
		text: { type: String, required: true },
	},
	{ timestamps: true }
);

// Chat Room Schema (Optional)
const chatRoomSchema = new Schema({
	name: { type: String, required: true },
	users: [{ type: Schema.Types.ObjectId, ref: "User" }],
	messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Message = mongoose.model("Message", messageSchema);
const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

module.exports = { User, Post, Comment, Message, ChatRoom };
