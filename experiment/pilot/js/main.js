// Loading data
Promise.all([
    d3.csv('data/data_ike_train.csv'),
    d3.csv('data/data_ike_test.csv'),
    d3.csv('data/data_zilin_train.csv'),
    d3.csv('data/data_zilin_test.csv'),
    d3.csv('data/preds_zilin_train.csv'),
    d3.csv('data/preds_zilin_test.csv'),
    d3.csv('data/featureImportance.csv'),
    d3.json('data/learningCurve.json')
]).then(data => {
    const [
      ikeDataTrain,
      ikeDataTest,
      zilinDataTrain,
      zilinDataTest,
      zilinPredsTrain,
      zilinPredsTest,
      featImportanceData,
      learningCurveData
    ] = data;

    zilinDataTrain.forEach((d, i) => {
      for (key in d) {
        d[key] = +d[key];
      }
      d.pred = +zilinPredsTrain[i].pred;
    })
    zilinDataTest.forEach((d, i) => {
      for (key in d) {
        d[key] = +d[key];
      }
      d.pred = +zilinPredsTest[i].pred;
    })

    ikeDataTrain.forEach(d => {
      for (key in d) {
        d[key] = +d[key];
      }
    })
    ikeDataTest.forEach(d => {
      for (key in d) {
        d[key] = +d[key];
      }
    })

    // new LearningCurveVis("vis", learningCurveData, {});
    // new HistogramVis("vis", {train: zilinDataTrain, test: zilinDataTest}, {});
    // new ConfusionMatrixVis("vis", zilinDataTest);
    new ScatterVis("vis", ikeDataTrain, {})
})