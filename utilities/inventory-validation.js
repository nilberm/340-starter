const { body, validationResult } = require("express-validator");
const utilities = require(".");
const inventoryModel = require("../models/inventory-model");

const validate = {};

validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage(
        "Classification must be alphanumeric with no spaces or special characters."
      )
      .custom(async (value) => {
        const exists = await inventoryModel.checkExistingClassification(value);
        if (exists) {
          throw new Error(
            "Classification already exists. Please choose a different name."
          );
        }
        return true;
      }),
  ];
};

validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    });
    return;
  }
  next();
};

validate.inventoryRules = () => {
  return [
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1900 }).withMessage("Valid year required."),
    body("inv_price").isFloat().withMessage("Valid price required."),
    body("inv_miles").isInt().withMessage("Miles must be a number."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description required."),
    body("inv_image").trim().notEmpty().withMessage("Image path required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path required."),
    body("classification_id")
      .notEmpty()
      .withMessage("Classification is required."),
  ];
};

validate.checkInvData = async (req, res, next) => {
  const errors = validationResult(req);
  const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  );
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors,
      ...req.body,
    });
    return;
  }
  next();
};

validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    });
    return;
  }
  next();
};

module.exports = validate;
