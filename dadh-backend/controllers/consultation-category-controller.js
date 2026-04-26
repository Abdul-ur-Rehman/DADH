const ConsultationCategory = require("../models/consultation-category-model");
// const { consultationCategory } = require("./admin-auth-controller");

const getAllCategories = async (req, res, next) => {
  try {
    const consultationCategories = await ConsultationCategory.find();
    if (!consultationCategories) {
      return res
        .status(400)
        .json({ state: false, message: "No categories found" });
    }
    res.status(200).json({
      state: true,
      data: consultationCategories,
    });
  } catch (error) {
    next(error);
  }
};

const getcategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const consultationCategory = await ConsultationCategory.findOne({ _id: id });
    if (!consultationCategory) {
      return res
        .status(400)
        .json({ state: false, message: "Category not found" });
    }
    res.status(200).json({
      state: true,
      data: consultationCategory,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, notes, key } = req.body;
    const consultationCategory = await ConsultationCategory.findByIdAndUpdate(
      id,
      { category, notes, key },
      { new: true }
    );
    if (!consultationCategory) {
      return res
        .status(400)
        .json({ state: false, message: "Category not found" });
    }
    res.status(200).json({
      state: true,
      data: consultationCategory,
    });
  } catch (error) {
    next(error);
  }
}
const getcategoryByKey = async (req, res, next) => {
  try {
    const {key} = req.body;
    const consultationCategory = await ConsultationCategory.findOne({ key: key });
    if (!consultationCategory) {
      return res
        .status(400)
        .json({ state: false, message: "Category not found" });
    }
    res.status(200).json({
      state: true,
      data: consultationCategory,
    });
  } catch (error) {
    next(error);
  }
};


const addConsultationCategory = async (req, res, next) => {
    try {
      const { category, notes,key } = req.body;
      const newCategory = new ConsultationCategory({
        category,
        notes,
        key
      });
      if (!category || !notes || !key) {
        return res.status(400).json({
          state: false,
          message: "please provide the required fields",
        });
      }
      const categoryExist = await ConsultationCategory.findOne({category});
      if (categoryExist) {
        return res.status(400).json({
          state: false,
          message: "category already exists.",
      });}
  
      await newCategory.save();
      res.status(201).json({
        state: true,
        message: "Consultation category added successfully.",
        data: newCategory,
      });
    } catch (err) {
      next(err);
    }
  };


  const deleteConsultationCategory = async (req, res, next) => {
    try {
      const id = req.params.id;
      const category = await ConsultationCategory.findByIdAndDelete({ _id: id });
      if (!category) {
        return res
          .status(404)
          .json({ state: false, message: "Consultation category not found" });
      }
      return res.status(200).json({ state: true, message: "Consultation category deleted successfully" });
    }
    catch (err) {
      next(err);
    }
  }
  const updateConsultationCategory = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { category, notes, key } = req.body;
      const updateCategory = await ConsultationCategory.findByIdAndUpdate(
        { _id: id },
        { category, notes, key },
        { new: true }
      );
      if (!updateCategory) {
        return res
          .status(404)
          .json({ state: false, message: "Consultation category not found" });
      }
      return res.status(200).json({
        state: true,
        message: "Consultation category updated successfully",
        data: updateCategory,
      });
    }
    catch (err) {
      next(err);
    }
  }



  

module.exports = {
    getAllCategories,
    getcategoryById,
    addConsultationCategory,
    deleteConsultationCategory,
    updateConsultationCategory,
    getcategoryByKey,
    updateCategoryById
};
