// addressController.js

const { User } = require("../models/usersSchemas"); // Import the User model

const updateCountry = async (req, res) => {
	const { userId } = req.params;
	const { country } = req.body;

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ msg: "User not found" });
		}

		user.address.country = country;
		await user.save();

		res.json(user.address.country);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

const updateState = async (req, res) => {
	const { userId } = req.params;
	const { state } = req.body;

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ msg: "User not found" });
		}

		user.address.state = state;
		await user.save();

		res.json(user.address.state);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

const updateLocalGovernment = async (req, res) => {
	const { userId } = req.params;
	const { localGovernment } = req.body;

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ msg: "User not found" });
		}

		user.address.localGovernment = localGovernment;
		await user.save();

		res.json(user.address.localGovernment);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

const updateStreet = async (req, res) => {
	const { userId } = req.params;
	const { street } = req.body;

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ msg: "User not found" });
		}

		user.address.street = street;
		await user.save();

		res.json(user.address.street);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};
const updateCity = async (req, res) => {
	const { userId } = req.params;
	const { city } = req.body;

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ msg: "User not found" });
		}

		user.address.city = city;
		await user.save();

		res.json(user.address.city);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
};

module.exports = {
	updateCountry,
	updateState,
	updateLocalGovernment,
	updateStreet,
	updateCity,
};
