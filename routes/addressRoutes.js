// addressRoutes.js

const express = require("express");
const router = express.Router();
const AddressController = require("../controllers/addressController");

router.put("/:userId/updateCountry", AddressController.updateCountry);
router.put("/:userId/updateState", AddressController.updateState);
router.put(
	"/:userId/updateLocalGovernment",
	AddressController.updateLocalGovernment
);
router.put("/:userId/updateStreet", AddressController.updateStreet);
router.put("/:userId/updateCity", AddressController.updateCity);

module.exports = router;
