"use strict";

let classificationList = document.querySelector("#classificationList");
classificationList.addEventListener("change", function () {
  let classification_id = classificationList.value;
  let classIdURL = "/inv/getInventory/" + classification_id;
  fetch(classIdURL)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw Error("Network response was not OK");
    })
    .then((data) => {
      buildInventoryList(data);
    })
    .catch((error) => {
      console.log("There was a problem: ", error.message);
    });
});

function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay");
  let dataTable = "<thead>";
  dataTable += "<tr><th>Vehicle Name</th><td></td><td></td></tr>";
  dataTable += "</thead><tbody>";

  data.forEach((vehicle) => {
    dataTable += `<tr><td>${vehicle.inv_make} ${vehicle.inv_model}</td>`;
    dataTable += `<td><a href='/inv/edit/${vehicle.inv_id}'>Modify</a></td>`;
    dataTable += `<td><a href='/inv/delete/${vehicle.inv_id}'>Delete</a></td></tr>`;
  });

  dataTable += "</tbody>";
  inventoryDisplay.innerHTML = dataTable;
}
