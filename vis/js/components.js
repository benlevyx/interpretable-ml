import FeatImportanceVis from "./feat-importance-vis";

var components = [
  {
    id: 0,
    name: 'feature-importance',
    draw: drawFeatureImportanceVis
  },
  {
    id: 1,
    name: 'pie-chart',
    draw: drawPieChartVis
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

function drawPieChartVis() {

}