const express = require("express");
const router = express.Router();
const {
  addTodo,
  getSingleTaskToEdit,
  saveEditedTask,
  deleteTask,
  getAllTasks,
  getAllTasksForUser
} = require("../../controllers/taskController");
const { verifyToken,verifyAdmin } = require("../../utils/verifyToken");

router.post("/add_todo/:id", verifyToken, addTodo);

router.get("/edit/:id/:tid", verifyToken, getSingleTaskToEdit);

router.get("/get_all_tasks/:id", verifyToken, getAllTasksForUser);

//saving the edited details
router.post("/edit/:id/:tid", verifyToken, saveEditedTask);

//deleting the task
router.delete("/delete/:id/:tid", verifyToken, deleteTask);

//get all tasks for admin
router.get("/get_all_tasks",verifyAdmin,getAllTasks)
module.exports = router;
