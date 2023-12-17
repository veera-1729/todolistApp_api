const User = require("../models/user")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createError } = require("../utils/error");
const register = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
      isAdmin: req.body.isAdmin,
    });

    await newUser.save();
    res.status(200).json("New user created successfuly");
  } catch (err) {
    console.log(err);
    next(err)
  }
};

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "User not found"));

    const isPasswordMatched =  bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordMatched)
      return next(createError(400, "Wrong password or username"));

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );

    const { password, isAdmin, ...otherDetails } = user._doc;
    console.log(otherDetails);
    return res
      .cookie("access_token", token, { httpsOnly: true })
      .status(200)
      .json(otherDetails);
  } catch (err) {
    console.log(err);
    next(err)
}
}

module.exports = {
  register,
  login
}