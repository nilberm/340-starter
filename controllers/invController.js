const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    let nav = await utilities.getNav();

    if (!data || data.length === 0) {
      return res.render("./inventory/classification", {
        title: "No vehicles found",
        nav,
        grid: "<p>Sorry, no matching vehicles could be found.</p>",
      });
    }

    const grid = await utilities.buildClassificationGrid(data);
    const className = data[0].classification_name;

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};


invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inventoryId = req.params.inventoryId;
    const data = await invModel.getInventoryById(inventoryId);

    if (!data) {
      throw new Error("Vehicle not found");
    }

    const detail = await utilities.buildInventoryDetail(data);
    let nav = await utilities.getNav();

    console.log(data);

    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      detail,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
