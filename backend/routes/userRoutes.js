const express = require("express");

const router = express.Router();
const {protect} = require("../middleware/authMiddleware");

const {
    registerUser,
    authUser,
    allUsers,
  } = require("../controllers/userControllers");

// we need to
router.route("/").post(registerUser);

// login
router.post("/login",authUser);

// seraching use route
router.route("/").get(protect, allUsers);

module.exports = router;