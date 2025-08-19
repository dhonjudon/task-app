const Category = require("../models/categoryModels");

const categoryController = {
  createCategory: async (req, res) => {
    try {
      const category = new Category({
        name: req.body.name,
        description: req.body.description || "",
        color: req.body.color || "#007bff",
      });
      const savedCategory = await category.save();
      res.status(201).json(savedCategory);
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ message: "Category name already exists" });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  },

  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category)
        return res.status(404).json({ message: "Category not found" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );
      if (!category)
        return res.status(404).json({ message: "Category not found" });
      res.json(category);
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ message: "Category name already exists" });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category)
        return res.status(404).json({ message: "Category not found" });
      res.json({ message: "Category deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = categoryController;
