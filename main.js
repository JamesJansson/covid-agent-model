import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import sendDataToChart from "./sendDataToCharts/index.js";

function callback(message) {
  console.log(message);
}

function addToTable(data, tableId) {
  const tableRef = document.getElementById(tableId);

  function addData(row, item) {
    const newCell = row.insertCell();
    const newText = document.createTextNode(item);
    newCell.appendChild(newText);
  }

  data.forEach(element => {
    const newRow = tableRef.insertRow();
    addData(newRow, element.day);
    addData(newRow, element.susceptible);
    addData(newRow, element.infected);
    addData(newRow, element.recovered);
    addData(newRow, element.newlyInfected);
    addData(newRow, element.newlyRecovered);
  });
}

let workerObj;
function init() {
  const worker = new Worker("./worker.js");
  // WebWorkers use `postMessage` and therefore work with Comlink.
  workerObj = Comlink.wrap(worker);
}
init();

async function runModel(settings) {
  console.log(settings);
  // const settings = {
  //   mode: "simpleCompartmentModel",
  //   numberOfPeople: 100000,
  //   initialInfected: 1000,
  //   infectionRate: 0.479,
  //   recoverRate: 0.065
  // };

  // const settings = {
  //   mode: "simpleAgentModel",
  //   numberOfPeople: 100000,
  //   initialInfected: 1000,
  //   connectionsPerPerson: 20,
  //   infectionProbability: 0.0063
  // };

  console.log("aaaaa");
  let results;
  if (settings.modelSelection === "compartment-model") {
    results = await workerObj.runSimpleCompartmentModelWrapper(settings);
  } else if (settings.modelSelection === "simple-agent-model") {
    console.log("bbbbb");
    results = await workerObj.runSimpleAgentModelWrapper(settings);
  } else {
    throw new Error("settings.modelSelection not found");
  }
  addToTable(results, "simple-agent-model-table");
  sendDataToChart(results);
}

function getInputVals() {
  const numberOfPeople = parseFloat(
    document.getElementById("numberOfPeopleSlider").value
  );
  const initialInfected = parseFloat(
    document.getElementById("initialInfectedSlider").value
  );
  const connectionsPerPerson = parseFloat(
    document.getElementById("connectionsPerPersonSlider").value
  );
  // Divide by 100 because it's a percentage
  const infectionProbability =
    parseFloat(document.getElementById("infectionProbabilitySlider").value) /
    100;

  const modelSelection = document.getElementById("model-selection").value;
  return {
    numberOfPeople,
    initialInfected,
    connectionsPerPerson,
    infectionProbability,
    modelSelection
  };
}

runModel(getInputVals());

// Set up the start button
const buttonRef = document.getElementById("start-button");

buttonRef.addEventListener(
  "click",
  function () {
    // Clear the graph on every click
    d3.select("#data-chart").html("");

    // Run the modal function
    runModel(getInputVals());
  },
  false
);

// Set up dropdown handler
const dropdownRef = document.getElementById("model-selection");

function dropdownHandler() {
  const value = dropdownRef.value;
  console.log(`Dropdown is set to: ${value}`);
  // TODO:
}

dropdownRef.addEventListener("change", dropdownHandler);

// Run function once to set up default
dropdownHandler();
