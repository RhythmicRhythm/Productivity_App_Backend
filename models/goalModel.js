const mongoose = require("mongoose");

const goalSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a goal title"],
    },
    description: {
      type: String,
    },
    target: {
      type: Number,
      required: [true, "Please add a target value"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contributions: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Goal = mongoose.model("Goal", goalSchema);
module.exports = Goal;