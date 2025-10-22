import express from "express";
import { protactedRoute } from "../middleware/auth.js";
import {
  createGroup,
  getUserGroups,
  addMember,
  removeMember,
  sendGroupMessage,
  getGroupMessages
} from "../controllers/Group.controller.js";

const router = express.Router();

/**
 * @route   POST /api/groups
 * @desc    Create a new group
 * @access  Private
 */
router.post("/", protactedRoute, createGroup);

/**
 * @route   GET /api/groups
 * @desc    Get all groups where user is a member
 * @access  Private
 */
router.get("/", protactedRoute, getUserGroups);

/**
 * @route   PUT /api/groups/add-member
 * @desc    Add member to a group (admin only)
 * @access  Private
 */
router.put("/add-member", protactedRoute, addMember);

/**
 * @route   PUT /api/groups/remove-member
 * @desc    Remove member from a group (admin only)
 * @access  Private
 */
router.put("/remove-member", protactedRoute, removeMember);

/**
 * @route   POST /api/groups/send-message
 * @desc    Send message to a group
 * @access  Private
 */
router.post('/send-message', protactedRoute, sendGroupMessage);

/**
 * @route   GET /api/groups/:groupId/messages
 * @desc    Get messages for a specific group
 * @access  Private
 */
router.get('/:groupId/messages', protactedRoute, getGroupMessages);

export default router;
