const express = require("express");
const router = express.Router();

const Task = require("../models/Task");

// GET - All Tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Create Task
router.post("/", async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;

    const taskData = { title, description };
    if (priority !== undefined) taskData.priority = priority;
    if (status !== undefined) taskData.status = status;
    if (dueDate !== undefined) taskData.dueDate = dueDate;

    const task = await Task.create(taskData);

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT & PATCH - Update Task (Title, Description, Priority, Status, Due Date)
const updateTaskHandler = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) updates.status = status;
    if (dueDate !== undefined) updates.dueDate = dueDate;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

router.put("/:id", updateTaskHandler);
router.patch("/:id", updateTaskHandler);

// DELETE - Delete Task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
