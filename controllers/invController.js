const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(
      classification_id
    );
    let nav = await utilities.getNav();

    if (!data || data.length === 0) {
      return res.render("./inventory/classification", {
        title: "No vehicles found",
        nav,
        grid: "<p>Sorry, no matching vehicles could be found.</p>",
      });
    }

    let userFavorites = [];
    if (res.locals.loggedin) {
      const account_id = res.locals.accountData.account_id;
      userFavorites = await invModel.getFavoritesByAccount(account_id);
    }

    const grid = await utilities.buildClassificationGrid(data, userFavorites);
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
    const nav = await utilities.getNav();

    if (!data) {
      const err = new Error("Vehicle not found");
      err.status = 404;
      return next(err);
    }

    let isFavorite = false;
    if (res.locals.loggedin) {
      const account_id = res.locals.accountData.account_id;
      const favorites = await invModel.getFavoritesByAccount(account_id);
      isFavorite = favorites.some((v) => Number(v.inv_id) === Number(inventoryId));
    }

    const detail = utilities.buildInventoryDetail(data, isFavorite);

    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      detail,
      isFavorite,
      inv_id: inventoryId,
    });
  } catch (error) {
    next(error);
  }
};


invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    errors: null,
  });
};

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  let nav = await utilities.getNav();
  const result = await invModel.addClassification(classification_name);

  if (result) {
    req.flash(
      "notice",
      `Classification "${classification_name}" added successfully.`
    );
    nav = await utilities.getNav();
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Failed to add classification.");
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  }
};

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
  });
};

invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList(
    parseInt(req.body.classification_id)
  );

  const result = await invModel.addVehicle(req.body);

  if (result) {
    req.flash("notice", "Vehicle successfully added.");
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Failed to add vehicle.");
    res.status(500).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: null,
      ...req.body,
    });
  }
};

invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0]?.inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      throw new Error("Vehicle not found");
    }

    const classificationSelect = await utilities.buildClassificationList(
      itemData.classification_id
    );
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      ...itemData,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

/* ***************************
 *  Add vehicle to favorites
 * ************************** */
invCont.addFavorite = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    const inv_id = parseInt(req.body.inv_id);
    const result = await invModel.addFavorite(account_id, inv_id);

    if (result) {
      req.flash("notice", "Vehicle added to favorites.");
    } else {
      req.flash("error", "Sorry, the vehicle could not be added to favorites.");
    }

    res.redirect("back");
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Remove vehicle from favorites
 * ************************** */
invCont.removeFavorite = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    const inv_id = parseInt(req.body.inv_id);
    const result = await invModel.removeFavorite(account_id, inv_id);

    if (result) {
      req.flash("notice", "Vehicle removed from favorites.");
    } else {
      req.flash(
        "error",
        "Sorry, the vehicle could not be removed from favorites."
      );
    }

    res.redirect("back");
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build Favorites View
 * ************************** */
invCont.buildFavoritesView = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    const favorites = await invModel.getFavoritesByAccount(account_id);
    let nav = await utilities.getNav();

    const grid = await utilities.buildClassificationGrid(favorites, favorites);

    res.render("./inventory/favorites", {
      title: "My Favorite Vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
