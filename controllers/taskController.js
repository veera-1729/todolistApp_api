const User = require("../models/user");
const todos = require("../models/task");
const { createError } = require("../utils/error");
const addTodo = async (req, res, next) => {
  // console.log(req.user);
  try {
    console.log(req.body);
    req.body.time = new Date(req.body.time);
    console.log(req.body);
    const foundUser = await User.findById(req.params.id);
    if (!foundUser) return next(createError(400, "Bad request user not found"));
    const task = await todos.create(req.body);
    task.user = foundUser.username;
    await task.save();
    foundUser.tasks.push(task);
    await foundUser.save();
    return res.status(201).json("New task created");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getAllTasksForUser = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit) || 10; // Number of tasks per page
//   console.log(page, limit);
  try {
    const user = await User.findById(req.params.id).populate("tasks");
    const totalTasks = user.tasks.length;
    const totalPages = Math.ceil(totalTasks / limit);
    const tasks = await todos
      .find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      tasks,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
const getSingleTaskToEdit = async (req, res, next) => {
  try {
    const foundUser = await User.findById(req.params.id);
    if (!foundUser) return next(createError(400, "Bad request user not found"));
    const task = await todos.findOne({
      user: foundUser.username,
      _id: req.params.tid,
    });
    if (!task) return next(createError(400, "Bad request task not found"));
    res.status(200).json({ task });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const saveEditedTask = async (req, res, next) => {
  try {
    const foundUser = await User.findById(req.params.id);
    if (!foundUser) return next(createError(400, "Bad request user not found"));
    const updatetask = await todos.findOneAndUpdate(
      { userID: foundUser._id, _id: req.params.tid },
      { ...req.body }
    );
    if (!updatetask)
      return next(createError(400, "Bad request task not found"));
    await updatetask.save();
    await foundUser.populate("tasks");
    await foundUser.save();
    const data = foundUser.tasks;
    res.status(200).json({ data });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const foundUser = await User.findById(req.params.id);
    if (!foundUser) return next(createError(400, "Bad request user not found"));
    const task = await todos.findOneAndDelete({
      userID: foundUser._id,
      _id: req.params.tid,
    });
    if (!task)
      return next(createError(400, "Bad request task not found to delete"));
    await foundUser.populate("tasks");
    await foundUser.save();
    const data = foundUser.tasks;
    res.status(200).json({ data });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getAllTasks = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit) || 10; // Number of tasks per page
  try {
    const totalTasks = await todos.countDocuments();
    const totalPages = Math.ceil(totalTasks / limit);

    const tasks = await todos
      .find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      tasks,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
module.exports = {
  addTodo,
  getSingleTaskToEdit,
  saveEditedTask,
  deleteTask,
  getAllTasks,
  getAllTasksForUser,
};
