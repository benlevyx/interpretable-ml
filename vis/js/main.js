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

// // LOADING DATA
// Load all data once, then call the vis constructors
Promise.all([
    d3.csv('data/new_data/feature_ranking.csv'),
    d3.csv('data/new_data/test_data.csv'),
    d3.text('data/new_data/confusion_matrix.csv'),
    d3.csv('data/new_data/class_votes.csv'),
    d3.csv('data/tut_cars.csv'),
    d3.csv('data/opt_cars.csv'),
    d3.csv('data/eval_cars.csv'),
    d3.csv('data/new_data/train_data.csv')

]).then(function(datasets) {
  var featRanking = datasets[0],
      testData = datasets[1],
      confMat = d3.csvParseRows(datasets[2]),
      classVotes = datasets[3],
      tut_cars = datasets[4],
      opt_cars = datasets[5],
      eval_cars = datasets[6],
      trainData = datasets[7];

  testData.forEach(d => {
    features.forEach(f => {
      d[f] = +d[f];
    })
  });

  trainData.forEach(d => {
    features.forEach(f => {
      d[f] = +d[f];
    })
  })

  tut_cars.forEach(d => {
    features.forEach(f => {
      d[f] = +d[f];
    })
  });

  opt_cars.forEach(d => {
    features.forEach(f => {
      d[f] = +d[f];
    })
  });

  eval_cars.forEach(d => {
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

  classVotes.forEach(d => {
    d.idx = +d[""];
    // delete d[""];
    levels.class.forEach(c => {
      d[c] = +d[c]
    });
  });

  window.data.featureRanking = featRanking;
  window.data.testData = testData;
  window.data.trainData = trainData;
  window.data.confMat = confMat;
  window.data.classVotes = classVotes;
  window.data.carTut = tut_cars;
  window.data.carOpt = opt_cars;
  window.data.carEval = eval_cars;
  window.components = components;
  
  // Simulating a randomly drawn car
  var nCars = window.data.testData.length,
      idx = Math.floor(Math.random() * nCars);

  window.selected.idx = idx;
  window.selected.obs = window.data.testData[idx];
  window.selected.class = window.selected.obs.class_pred;


  // Setting the left panel
  updateLeftPanel(window.selected.obs, 0.4, 20, 40);
  
  //components[4].draw('vis-0');
  //components[5].draw('vis-1');
  //components[1].draw('vis-2');
  //components[3].draw('vis-3');

  //for(var op in components){
  //  components[op].draw(components[op]['name']);
  //}

});
