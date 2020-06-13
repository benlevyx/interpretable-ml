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
    draw: drawConfusionMatrix,
    desc: "This confusion matrix shows you how many cars were classified correctly and incorrectly. " +
          "Each column represents the true class of each car and each row represents the predicted classes. " +
          "The count in each cell shows the number of cars from that true class (column) that were classified " +
          "as the predicted class (row). The diagonal elements are the correctly classified cars.",
    tutorialGroup: null
  },
  {
    id: 1,
    name: 'feature-importance-bubble',
    draw: drawFeatureImportanceBubble,
    desc: "These charts all show the \"importance\" of each feature, which is how much each feature " +
        "contributed to the decision of the random forest; the greater the feature importance, the " +
        "more a change in that feature could lead to a change in the predicted class. The size of the circles, " +
        "pie slices, or rectangles are proportional to the importance of the feature.",
    tutorialGroup: 'feature-importance'
  },
  {
    id: 2,
    name: 'feature-importance-pie',
    draw: drawFeatureImportancePie,
    desc: "",
    tutorialGroup: 'feature-importance'
  },
  {
    id: 3,
    name: 'feature-importance-tree',
    draw: drawFeatureImportanceTree,
    desc: "",
    tutorialGroup: 'feature-importance'
  },
  {
    id: 4,
    name: 'parallel-coordinates',
    draw: drawParallelCoordinatesVis,
    desc: "This parallel coordinates chart shows the features of the selected car compared to the average" +
          " features of all cars with the same class as the selected car's predicted class.",
    tutorialGroup: null
  },
  {
    id: 5,
    name: 'class-vote',
    draw: drawClassVoteVis,
    desc: "The random forest is comprised of 100 individual decision trees. Each decision tree comes up with " +
        "a prediction for the selected car and \"votes\" for that predicted class. The overall predicted class " +
        "for the car is the class with the most votes from the individual trees. This visualization shows how " +
        "many trees voted for each class.",
    tutorialGroup: null
  }
];


// ******************** FUNCTIONS TO RENDER VIS ******************** //

// To add yours, declare a new function called draw<VIS-NAME> and pass in the data,
// div ID, and an optional config

function drawFeatureImportanceTree(vis = 'test-vis') {
  var config = {
    'margin': {
      'bottom': 10,
      'left': 10,
      'top': 15,
      'right': 10
    },
    title: "Feature importances"
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
    },
    title: "Feature importances"
  };
  window.visComps.featImportanceVisPie = new FeatImportancePie(vis, window.data.featureRanking, config);
}

function drawParallelCoordinatesVis(vis = 'test-vis') {
  var margin = {
        bottom: 40,
        left: 70,
        top: 20,
        right: 75
      },
      config = {
        margin: margin,
        title: "Comparing selected car to all cars with predicted class",
        featImportanceDiameter: true
      },
      visData = {
        carData: window.data.trainData,
        featImportances: window.data.featureRanking
      };
  window.visComps.parallelCoordsVis = new ParallelCoordsVis(vis, visData, config);
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
      'right': 20
    },
    title: "Feature importances"
  };

  // Then create the vis and store it in the global `visComps` so that it can
  // be accessed in other scopes.
  window.visComps.featImportanceBubble = new FeatImportanceBubble(vis, window.data.featureRanking, config);
}

function drawConfusionMatrix(vis = 'test-vis') {

  var config = {
    'margin': {
      'bottom': 10,
      'left': 40,
      'top': 35,
      'right': 10
    },
    title: "Confusion matrix"
  };
  window.visComps.confusionMatrix = new ConfusionMatrix(vis, window.data.confMat, config);
}

function drawClassVoteVis(vis = 'test-vis') {
  var config = {
    margin: {
      bottom: 20,
      left: 10,
      top: 35,
      right: 10
    },
    title: "How each tree in random forest voted"
  };
  window.visComps.classVote = new ClassVoteVis(vis, window.data.classVotes, config);
}