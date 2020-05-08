// Imports
// Here we import each component from this folder (no need to add a script tag for each one
import FeatImportanceVis from './feat-importance-vis.js';
import FeatMeanVis from "./feat-mean-vis.js";
import FeatImportanceBubble from './feat-importance-bubble.js';

import {components} from './components.js';

// Defining globals
// This way, all data and visualization components can be accessed from any scope
// once declared
window.data = {};
window.visComps = {};
window.selected = {
  class: null,
  obs: null
};

// Simulating a randomly drawn car


// // LOADING DATA
// Load all data once, then call the vis constructors
Promise.all([
    d3.csv('data/feature_ranking.csv'),
    d3.csv('data/all_data_encoded.csv'),
    d3.text('data/confusion_matrix.csv')
]).then(function(datasets) {
  var featRanking = datasets[0],
      allData = datasets[1],
      confMat = d3.csvParseRows(datasets[2]);

  allData.forEach(d => {
    features.forEach(f => {
      d[f] = +d[f];
    })
  });

  featRanking.forEach(d => {
    d.value = +d.value;
    d.std = +d.std;
  });

  confMat.forEach(d => {
    d.forEach((e, i) => {
      d[i] = +e;
    })
  });

  window.data.featureRanking = featRanking;
  window.data.carData = allData;
  window.data.confMat = confMat;

  // Simulating a randomly drawn car
  var nCars = window.data.carData.length,
      idx = Math.floor(Math.random() * nCars);


  window.selected.obs = window.data.carData[idx];
  window.selected.class = window.selected.obs.class;

  // Setting the left panel
  updateLeftPanel(window.selected.obs);

  // components[1].draw()
  // components[2].draw();
  components[5].draw()
});
