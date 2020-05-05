import FeatImportanceVis from "./feat-importance-vis.js";
import FeatMeanVis from "./feat-mean-vis.js";
import ParallelCoordsVis from "./parallel-coords-vis.js";
import FeatImportanceBubble from "./feat-importance-bubble.js";
import ConfusionMatrix from "./confusion-matrix.js";

export var components = [
  {
    id: 0,
    name: 'feature-importance',
    draw: drawFeatureImportanceVis
  },
  {
    id: 1,
    name: 'parallel-coordinates',
    draw: drawParallelCoordinatesVis
  },
  {
    id: 2,
    name: 'feature-importance-bubble',
    draw: drawFeatureImportanceBubble
  },
  {
    id: 3,
    name: 'confusion-matrix',
    draw: drawConfusionMatrix
  }
];


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
  window.visComps.featImportanceVis = FeatImportanceVis('test-vis', window.data.featureRanking, config);

}

function drawParallelCoordinatesVis() {
  var margin = {
        bottom: 40,
        left: 70,
        top: 10,
        right: 50
      },
      config = {
        margin: margin,
        selected: window.selected.obs
      };
  window.visComps.parallelCoordsVis = new ParallelCoordsVis('test-vis', window.data.carData, config);
}

function drawFeatureImportanceBubble() {
  // The config can contain manually chosen margins, height, width,
  // and more. E.g. you can specify the index of a point to highlight,
  // which is then used in the vis to select/highlight elements
  var config = {
    'margin': {
      'bottom': 10,
      'left': 10,
      'top': 10,
      'right': 10
    }
  };

  // Then create the vis and store it in the global `visComps` so that it can
  // be accessed in other scopes.
  window.visComps.featImportanceBubble = new FeatImportanceBubble('test-vis', window.data.featureRanking, config);
}

function drawConfusionMatrix() {

  var config = {
    'margin': {
      'bottom': 10,
      'left': 10,
      'top': 10,
      'right': 10
    }
  };

  window.visComps.confusionMatrix = new ConfusionMatrix('test-vis', window.data.confMat, config);
}