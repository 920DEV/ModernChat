const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
// Only for logged in user & chat creation

router.route("/").post(protect, accessChat);

router.route("/").get(protect, fetchChats);
// route for creating a group
router.route("/group").post(protect, createGroupChat);

// route for renaming the group
router.route("/rename").put(protect, renameGroup);

// route for removing or deleting group.
router.route("/groupremove").put(protect, removeFromGroup);

// route for adding someone to 
router.route("/groupadd").put(protect, addToGroup);

module.exports = router;