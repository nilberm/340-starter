const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

async function getInventoryById(inventoryId) {
  try {
    const result = await pool.query(
      `SELECT * FROM inventory WHERE inv_id = $1`,
      [inventoryId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getInventoryById error:", error);
  }
}

async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1)";
    const data = await pool.query(sql, [classification_name]);
    return data.rowCount;
  } catch (error) {
    console.error("Add classification error:", error);
    return null;
  }
}

async function addVehicle(vehicle) {
  try {
    const sql = `INSERT INTO inventory (
      classification_id, inv_make, inv_model, inv_year,
      inv_description, inv_image, inv_thumbnail, inv_price,
      inv_miles, inv_color
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;
    const data = await pool.query(sql, [
      vehicle.classification_id,
      vehicle.inv_make,
      vehicle.inv_model,
      vehicle.inv_year,
      vehicle.inv_description,
      vehicle.inv_image,
      vehicle.inv_thumbnail,
      vehicle.inv_price,
      vehicle.inv_miles,
      vehicle.inv_color,
    ]);
    return data.rowCount;
  } catch (error) {
    console.error("Error inserting vehicle:", error);
    return null;
  }
}

async function checkExistingClassification(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1";
    const result = await pool.query(sql, [classification_name]);
    return result.rowCount > 0;
  } catch (error) {
    throw new Error("Database error during uniqueness check");
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET inv_make = $1,
          inv_model = $2,
          inv_description = $3,
          inv_image = $4,
          inv_thumbnail = $5,
          inv_price = $6,
          inv_year = $7,
          inv_miles = $8,
          inv_color = $9,
          classification_id = $10
      WHERE inv_id = $11
      RETURNING *;
    `;
    const data = await pool.query(sql, [
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
      inv_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
  }
}

/* ***************************
 *  Add favorite vehicle
 * ************************** */
async function addFavorite(account_id, inv_id) {
  try {
    const sql = `
      INSERT INTO favorites (account_id, inv_id)
      VALUES ($1, $2)
      RETURNING *`;
    const data = await pool.query(sql, [account_id, inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("addFavorite error:", error);
    return null;
  }
}

/* ***************************
 *  Remove favorite vehicle
 * ************************** */
async function removeFavorite(account_id, inv_id) {
  try {
    const sql = `
      DELETE FROM favorites
      WHERE account_id = $1 AND inv_id = $2
      RETURNING *`;
    const data = await pool.query(sql, [account_id, inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("removeFavorite error:", error);
    return null;
  }
}

/* ***************************
 *  Get favorites by account
 * ************************** */
async function getFavoritesByAccount(account_id) {
  try {
    const sql = `
      SELECT i.*
      FROM favorites f
      JOIN inventory i ON f.inv_id = i.inv_id
      WHERE f.account_id = $1
      ORDER BY i.inv_make, i.inv_model`;
    const data = await pool.query(sql, [account_id]);
    return data.rows;
  } catch (error) {
    console.error("getFavoritesByAccount error:", error);
    return [];
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  addVehicle,
  checkExistingClassification,
  updateInventory,
  addFavorite,
  removeFavorite,
  getFavoritesByAccount,
};
