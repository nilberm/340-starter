const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const classValidate = require("../utilities/inventory-validation");
const invValidate = require("../utilities/inventory-validation");
const utilities = require("../utilities");

// Public Routes
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inventoryId", invController.buildByInventoryId);
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Protected Routes (need login)
router.get("/", utilities.checkLogin, invController.buildManagement);

router.get("/add-classification", utilities.checkLogin, invController.buildAddClassification);
router.post(
  "/add-classification",
  utilities.checkLogin,
  classValidate.classificationRules(),
  classValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
);

router.get("/add-inventory", utilities.checkLogin, invController.buildAddInventory);
router.post(
  "/add-inventory",
  utilities.checkLogin,
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
);

router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  utilities.handleErrors(invController.editInventoryView)
);

router.post(
  "/update",
  utilities.checkLogin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

module.exports = router;
