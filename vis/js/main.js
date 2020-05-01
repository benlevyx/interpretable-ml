// Imports
// Here we import each component from this folder (no need to add a script tag for each one
import FeatImportanceVis from './feat-importance-vis.js';
import FeatMeanVis from "./feat-mean-vis.js";

import {components} from './components.js';

// Defining globals
// This way, all data and visualization components can be accessed from any scope
// once declared
window.data = {};
window.visComps = {};

// // LOADING DATA
// d3.csv('data/feature_ranking.csv').then(function(featureRanking) {
//   featureRanking.forEach(d => {
//     d.value = +d.value;
//     d.std = +d.std;
//   });
//
//   // Save the data in a global. This is to minimize the number of times we need
//   // to load the data. If it's loaded once, it's accessible by all functions.
//   data.featureRanking = featureRanking;
//
//   // Call the relevant function
//   drawFeatureImportanceVis();
// });

d3.csv('data/feature_means.csv').then(function(featureMeans) {
  var features = featureMeans.map(d => d.feature),
      values = featureMeans.map(d => +d.value),
      featureMeansParsed = {features: features, values: values};
  console.log(features);
  window.data.featureMeans = featureMeansParsed;

  components[2].draw();
});

// ******************** FUNCTIONS TO RENDER VIS ******************** //

// To add yours, declare a new function called draw<VIS-NAME> and pass in the data,
// div ID, and an optional config
function drawFeatureImportanceVis() {
  // The config can contain manually chosen margins, height, width,
  // and more. E.g. you can specify the index of a point to highlight,
  // which is then used in the vis to select/highlight elements
  var config = {
    'margin': {
      'bottom': 90,
      'left': 40,
      'top': 10,
      'right': 10
    }
  };

  // Then create the vis and store it in the global `visComps` so that it can
  // be accessed in other scopes.
  window.visComps.featImportanceVis = new FeatImportanceVis('feat-importance-vis', data.featureRanking, config);

}
