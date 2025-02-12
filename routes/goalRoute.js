const express = require("express");
const router = express.Router();
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  addContribution,
} = require("../controllers/goalController");
const auth = require("../middleWare/authMiddleware");

// @route   POST /api/goals
// @desc    Create a new goal
// @access  Private
router.post("/", auth, createGoal);

// @route   GET /api/goals
// @desc    Get all goals for a user
// @access  Private
router.get("/", auth, getGoals);

// @route   GET /api/goals/:id
// @desc    Get a single goal by ID
// @access  Private
router.get("/:id", auth, getGoalById);

// @route   PUT /api/goals/:id
// @desc    Update a goal
// @access  Private
router.put("/:id", auth, updateGoal);

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
// @access  Private
router.delete("/:id", auth, deleteGoal);

// @route   POST /api/goals/:id/contributions
// @desc    Add a contribution to a goal
// @access  Private
router.post("/:id/contributions", auth, addContribution);

module.exports = router;