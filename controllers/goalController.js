const asyncHandler = require("express-async-handler");
const Goal = require("../models/goalModel");

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = asyncHandler(async (req, res) => {
  const { title, description, target } = req.body;

  // Validation
  if (!title || !target) {
    return res.status(400).json({ message: "Please provide a title and target for the goal" });
  }

  try {
    const goal = await Goal.create({
      title,
      description,
      target,
      createdBy: req.userId, // Attach the user ID from the authenticated request
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Get all goals for a user
// @route   GET /api/goals
// @access  Private
const getGoals = asyncHandler(async (req, res) => {
  try {
    const goals = await Goal.find({ createdBy: req.userId });
    res.status(200).json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Get a single goal by ID
// @route   GET /api/goals/:id
// @access  Private
const getGoalById = asyncHandler(async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, createdBy: req.userId });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.status(200).json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = asyncHandler(async (req, res) => {
  const { title, description, target } = req.body;

  try {
    const goal = await Goal.findOne({ _id: req.params.id, createdBy: req.userId });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Update goal fields
    goal.title = title || goal.title;
    goal.description = description || goal.description;
    goal.target = target || goal.target;

    const updatedGoal = await goal.save();
    res.status(200).json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = asyncHandler(async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, createdBy: req.userId });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    await goal.remove();
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Add a contribution to a goal
// @route   POST /api/goals/:id/contributions
// @access  Private
const addContribution = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  // Validation
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Please provide a valid contribution amount" });
  }

  try {
    const goal = await Goal.findOne({ _id: req.params.id, createdBy: req.userId });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Add contribution
    goal.contributions.push({ date: new Date(), amount });
    const updatedGoal = await goal.save();

    res.status(201).json(updatedGoal);
  } catch (error) {
    console.error("Error adding contribution:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  addContribution,
};