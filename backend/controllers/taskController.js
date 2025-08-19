const Task = require("../models/taskModel");

const taskController = {
  createTask: async (req, res) => {
    try {
      const task = new Task({
        title: req.body.title,
        description: req.body.description || "",
        completed: req.body.completed || false,
        category: req.body.category || null,
        dueDate: req.body.dueDate || null,
        priority: req.body.priority || "medium",
      });
      const savedTask = await task.save();
      const populatedTask = await Task.findById(savedTask._id).populate(
        "category"
      );
      res.status(201).json(populatedTask);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllTasks: async (req, res) => {
    try {
      const tasks = await Task.find().populate("category");
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getTaskById: async (req, res) => {
    try {
      const task = await Task.findById(req.params.id).populate("category");
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateTask: async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      }).populate("category");
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteTask: async (req, res) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json({ message: "Task deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = taskController;
