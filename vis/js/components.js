import ConfusionMatrix from "./confusion-matrix.js";
import FeatImportanceBubble from "./feat-importance-bubble.js";
import FeatImportancePie from "./feat-importance-pie.js";
import FeatImportanceTreemap from "./feat-importance-treemap.js";
import FeatImportanceVis from "./feat-importance-vis.js";
import FeatMeanVis from "./feat-mean-vis.js";
import ParallelCoordsVis from "./parallel-coords-vis.js";
import ClassVoteVis from "./class-vote-vis.js";

export var components = [
  {
    id: 0,
    name: 'confusion-matrix',
    draw: drawConfusionMatrix
  },
  {
    id: 1,
    name: 'feature-importance-bubble',
    draw: drawFeatureImportanceBubble
  },
  {
    id: 2,
    name: 'feature-importance-pie',
    draw: drawFeatureImportancePie
  },
  {
    id: 3,
    name: 'feature-importance-tree',
    draw: drawFeatureImportanceTree
  },
  {
    id: 4,
    name: 'parallel-coordinates',
    draw: drawParallelCoordinatesVis
  },
  {
    id: 5,
    name: 'class-vote',
    draw: drawClassVoteVis
  }
];


// ******************** FUNCTIONS TO RENDER VIS ******************** //

// To add yours, declare a new function called draw<VIS-NAME> and pass in the data,
// div ID, and an optional config

function drawFeatureImportanceMean(vis = 'test-vis') {
  var config = {
    'margin': {
      'bottom': 10,
      'left': 10,
      'top': 10,
      'right': 10
    }
  };
  window.visComps.featImportanceMean = new FeatMeanVis(vis, window.data.featureRanking, config);


}

function drawFeatureImportanceTree(vis = 'test-vis') {
  var config = {
    'margin': {
      'bottom': 10,
      'left': 10,
      'top': 10,
      'right': 10
    }
  };

  window.visComps.featImportanceVisTree = new FeatImportanceTreemap(vis, window.data.featureRanking, config);

}

function drawFeatureImportancePie(vis = 'test-vis') {
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
  window.visComps.featImportanceVisPie = new FeatImportancePie(vis, window.data.featureRanking, config);
}

function drawFeatureImportanceVis(vis = 'test-vis') {
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
  window.visComps.featImportanceVis = new FeatImportanceVis(vis, window.data.featureRanking, config);

}

function drawParallelCoordinatesVis(vis = 'test-vis') {
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
  window.visComps.parallelCoordsVis = new ParallelCoordsVis(vis, window.data.carData, config);
}

function drawFeatureImportanceBubble(vis = 'test-vis') {
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
  window.visComps.featImportanceBubble = new FeatImportanceBubble(vis, window.data.featureRanking, config);
}

function drawConfusionMatrix(vis = 'test-vis') {

  var config = {
    'margin': {
      'bottom': 10,
      'left': 10,
      'top': 20,
      'right': 10
    }
  };

  window.visComps.confusionMatrix = new ConfusionMatrix(vis, window.data.confMat, config);
}

function drawClassVoteVis(vis = 'test-vis') {
  var config = {
    margin: {
      bottom: 10,
      left: 10,
      top: 10,
      right: 10
    }
  };
  window.visComps.classVote = new ClassVoteVis(vis, window.data.classVotes, config);
}