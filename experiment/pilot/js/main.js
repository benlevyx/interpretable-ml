// Loading data
Promise.all([
      'data/class_imbalance_vs_underfitting.json',
      'data/class_imbalance.json',
      'data/ood_vs_class_imbalance.json',
      'data/ood_vs_overfitting.json',
      'data/ood.json',
      'data/overfitting.json',
      'data/underfitting_vs_ood.json',
      'data/underfitting.json'
    ].map(file => d3.json(file)))
  .then(data => {
    var [
      dataClassImbalanceVsUnderfitting,
      dataClassImbalance,
      dataOodVsClassImbalance,
      dataOodVsOverfitting,
      dataOod,
      dataOverfitting,
      dataUnderfittingVsOod,
      dataUnderfitting
    ] = data.map(parseData);


    // new LearningCurveVis("vis", dataUnderfittingVsOod.learningCurve, {});
    // new HistogramVis("vis", dataOodVsClassImbalance.data, {});
    // new ConfusionMatrixVis("vis", dataOodVsClassImbalance.data, {width: "400px"});
    new ScatterVis("vis", dataOod.data.train, {})
    // new FeatureImportanceVis("vis", dataOodVsOverfitting.featureImportance, {})
})