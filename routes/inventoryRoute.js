const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const classValidate = require("../utilities/inventory-validation");
const invValidate = require("../utilities/inventory-validation");
const utilities = require("../utilities");

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inventoryId", invController.buildByInventoryId);
router.get("/", invController.buildManagement);
router.get("/add-classification", invController.buildAddClassification);
router.post(
  "/add-classification",
  classValidate.classificationRules(),
  classValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
);
router.get("/add-inventory", invController.buildAddInventory);
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;
