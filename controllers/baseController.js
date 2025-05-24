const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("index", { title: "Home", nav });
  } catch (error) {
    next(error);
  }
};

baseController.throwError = function (req, res, next) {
  try {
    throw new Error("Intentional test error for Task 3");
  } catch (err) {
    next(err);
  }
};

module.exports = baseController;
