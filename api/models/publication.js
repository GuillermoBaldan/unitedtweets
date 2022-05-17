"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PublicationSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: false,
  },
  created_at: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Publication", PublicationSchema);
