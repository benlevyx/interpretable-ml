import FeatImportanceVis from "./feat-importance-vis.js";
import FeatMeanVis from "./feat-mean-vis.js";

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
    name: 'feature-mean',
    draw: drawFeatureMeanVis
  }
];


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
  return new FeatImportanceVis('feature-importance-vis', data.featureRanking, config);

}


function drawFeatureMeanVis() {
  var selected = {value: 2.1, label: 'Selected car' },
      margin = {
        bottom: 40,
        left: 70,
        top: 10,
        right: 50
      },
      config = {
        margin: margin,
        selected: selected
      };
  window.visComps.featMeanVis = new FeatMeanVis('feat-mean-vis', window.data.featureMeans, config);
}

function drawParallelCoordinatesVis() {

}