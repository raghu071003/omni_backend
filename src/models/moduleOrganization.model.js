const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const moduleSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    classification: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    team_id: {
      type: String,
      ref: "Team",
      default: null,
    },
    sub_team_id: {
      type: String,
      ref: "SubTeam",
      default: null,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    version: {
      type: String,
      default: "1.0",
    },
    content: {
      type: String,
      default: null,
    },
    module_files: {
      type: [String], // Array of file URLs or identifiers
      default: [],
    },
    created_by: {
      type: String,
      ref: "User",
    },
    updated_by: {
      type: String,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Module = mongoose.model("Module", moduleSchema);

module.exports = Module;
