const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a valid full name"],
    trim: true,
    match: [/^[A-Z][a-z]*\s[A-Z][a-z]*$/, "Please provide a valid full name"],
  },
  email: {
    type: String,
    required: [true, "Please provide a valid email address"],
    validate: {
      validator: validator.default.isEmail,
      message: "Please provide a valid email address",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide a valid password"],
    minLength: 6,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
