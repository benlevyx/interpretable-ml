// Imports
import FeatImportanceVis from './feat-importance-vis.js';

// Defining globals
var data = {},
    featImportanceVis;

// LOADING DATA
d3.csv('../data/feature_ranking.csv').then(function(featureRanking) {
  featureRanking.forEach(d => {
    d.value = +d.value;
    d.std = +d.std;
  });

  // Save the data in a global
  data.featureRanking = featureRanking;

  drawFeatureImportanceVis();
});

// FUNCTIONS TO RENDER VIS
function drawFeatureImportanceVis() {
  var config = {
    'margin': {
      'bottom': 90,
      'left': 40,
      'top': 10,
      'right': 10
    }
  };
  featImportanceVis = new FeatImportanceVis('feat-importance-vis', data.featureRanking, config);
}