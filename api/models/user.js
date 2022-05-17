"use strict";
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: false,
  },
  nick: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "USER_ROLE",
  },
  image: {
    type: String,
    required: false,
  },
});

module.export = mongoose.model("User", UserSchema);
