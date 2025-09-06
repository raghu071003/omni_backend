const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const assignmentSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index:true
    },
    organization_id: {
      type: String,
      required: true,
      ref: "Organization",
    },
    module_type: {
      type: String,
      required: true,
      enum: ["module", "assessment", "survey", "learning_path"],
    },
    module_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    assign_on: {
      type: Date,
      required: true,
    },
    due_date: {
      type: Date,
      required: true,
    },
    notify_users: {
      type: Boolean,
      default: true,
    },
    recurssive: {  
      type: Boolean,
      default: false,
    },
    created_by: {
      type: String,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const ForUserAssignment = mongoose.model("ForUserAssignment", assignmentSchema);

module.exports = ForUserAssignment;
