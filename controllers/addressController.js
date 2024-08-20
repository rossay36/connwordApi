const cron = require("node-cron");
const mongoose = require("mongoose");
const { User, Post, Comment } = require("../models/usersSchemas");

const updatePersonalDetails = async (req, res) => {
	const {
		userId,
		username,
		firstname,
		lastname,
		bio,
		job,
		workAt,
		relationship,
	} = req.body;

	try {
		// Check if required fields are present
		if (!userId) {
			return res.status(400).json({ message: "User ID is required" });
		}

		// Verify permissions
		if (
			req.userId !== userId &&
			!req.roles.includes("Admin") &&
			!req.roles.includes("Manager")
		) {
			return res
				.status(403)
				.json({ message: "Forbidden: You can only update your own account" });
		}

		// Build update object with only provided fields
		const updateObj = {};
		if (username) updateObj.username = username;
		if (firstname) updateObj.firstname = firstname;
		if (lastname) updateObj.lastname = lastname;
		if (bio) updateObj.bio = bio;
		if (job) updateObj.job = job;
		if (workAt) updateObj.workAt = workAt;
		if (relationship) updateObj.relationship = relationship;

		// Find and update user
		const updatedUser = await User.findOneAndUpdate(
			{ _id: userId },
			updateObj,
			{ new: true }
		);

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Return response
		res.json({ message: `${updatedUser.username} updated`, user: updatedUser });
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: "Server Error" });
	}
};

const updateUserAddress = async (req, res) => {
	const { userId } = req.body;
	const { street, city, state, country, postalCode } = req.body.address || {}; // Destructure address fields from request body, default to empty object if undefined

	try {
		// Check if required fields are present
		if (!userId) {
			return res.status(400).json({ message: "User ID is required" });
		}

		// Verify permissions
		if (
			req.userId !== userId &&
			!req.roles.includes("Admin") &&
			!req.roles.includes("Manager")
		) {
			return res
				.status(403)
				.json({ message: "Forbidden: You can only update your own account" });
		}

		// Check if address fields are provided
		if (!street || !city || !state || !country || !postalCode) {
			return res.status(400).json({
				message:
					"Address fields (street, city, state, country, postalCode) are required",
			});
		}

		// Find user by ID and update address fields
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				$set: {
					"address.street": street,
					"address.city": city,
					"address.state": state,
					"address.country": country,
					"address.postalCode": postalCode,
				},
			},
			{ new: true }
		);

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Return response with updated user
		res.json({
			message: `${updatedUser.username}'s address updated`,
			user: updatedUser,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: "Server Error" });
	}
};

const updateUserLives = async (req, res) => {
	const { userId } = req.body;
	const { currentStreet, currentCity, currentState, currentCountry } =
		req.body.lives || {}; // Destructure address fields from request body, default to empty object if undefined

	try {
		// Check if required fields are present
		if (!userId) {
			return res.status(400).json({ message: "User ID is required" });
		}

		// Verify permissions
		if (
			req.userId !== userId &&
			!req.roles.includes("Admin") &&
			!req.roles.includes("Manager")
		) {
			return res
				.status(403)
				.json({ message: "Forbidden: You can only update your own account" });
		}

		// Check if address fields are provided
		if (!currentStreet || !currentCity || !currentState || !currentCountry) {
			return res.status(400).json({
				message:
					"Address fields (street, city, state, country, postalCode) are required",
			});
		}

		// Find user by ID and update address fields
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				$set: {
					"lives.currentStreet": currentStreet,
					"lives.currentCity": currentCity,
					"lives.currentState": currentState,
					"lives.currentCountry": currentCountry,
				},
			},
			{ new: true }
		);

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Return response with updated user
		res.json({
			message: `${updatedUser.username}'s Current Address updated`,
			user: updatedUser,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: "Server Error" });
	}
};
const updateEducation = async (req, res) => {
	const { userId } = req.body;
	const { college, university, degree, fieldOfStudy, startYear, endYear } =
		req.body.education || {}; // Destructure address fields from request body, default to empty object if undefined

	try {
		// Check if required fields are present
		if (!userId) {
			return res.status(400).json({ message: "User ID is required" });
		}

		// Verify permissions
		if (
			req.userId !== userId &&
			!req.roles.includes("Admin") &&
			!req.roles.includes("Manager")
		) {
			return res
				.status(403)
				.json({ message: "Forbidden: You can only update your own account" });
		}

		// Check if address fields are provided
		if (
			!college ||
			!university ||
			!degree ||
			!fieldOfStudy ||
			!startYear ||
			!endYear
		) {
			return res.status(400).json({
				message:
					"Address fields (college, university, degree, fieldOfStudy, startYear, endYear) are required",
			});
		}

		// Find user by ID and update address fields
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				$set: {
					"education.college": college,
					"education.university": university,
					"education.degree": degree,
					"education.fieldOfStudy": fieldOfStudy,
					"education.startYear": startYear,
					"education.endYear": endYear,
				},
			},
			{ new: true }
		);

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Return response with updated user
		res.json({
			message: `${updatedUser.username}'s User Education updated`,
			user: updatedUser,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: "Server Error" });
	}
};

module.exports = {
	updatePersonalDetails,
	updateUserAddress,
	updateUserLives,
	updateEducation,
};
