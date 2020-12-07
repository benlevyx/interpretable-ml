class HistogramVis extends Vis {
  initVis() {
    const vis = this;

    this.kernel = vis.config.kernel || .5;
    const kernel = kernelEpanechnikov(vis.kernel)
    vis.numFeatures = Object.keys(vis.data.train[0]).length - 1 // Removing the class label column;
    vis.childWidth = d3.select(vis.parentElement).node().getBoundingClientRect().width / vis.numFeatures;
    console.log(vis.data, vis.numFeatures);
    const allData = vis.data.train.concat(vis.data.test);
    
    vis.displayData = d3.range(vis.numFeatures).map(i => {

      const extent = d3.extent(allData, d => d[i]);
      const xRange = d3.ticks(extent[0], extent[1], 50)
      const kde = kernelDensityEstimator(kernel, xRange);

      const res = {x: xRange};
      ['train', 'test'].forEach(name => {
        res[name] = kde(vis.data[name].map(d => d[i]))
      })
      return res
    })

    console.log(vis.displayData);

    this.wrangleData();
  }

  wrangleData() {
    const vis = this;

    vis.c3Data = vis.displayData.map(data => {
      return [
        ['x', ...data.x],
        ['train', ...data.train],
        ['test', ...data.test]
      ]
    })
    console.log(vis.c3Data);

    vis.updateVis();
  }

  updateVis() {
    var vis = this;

    d3.range(vis.numFeatures).forEach(i => {
      const div = d3.select(vis.parentElement).append('div');

      vis.chart = c3.generate({
        data: {
          columns: vis.c3Data[i],
          x: 'x',
          types: {train: 'area-spline', test: 'area-spline'}
        },
        bindto: div,
        tooltip: {
          format: {
              title: d => `Feature ${i}`,
              value: (value, ratio, id) => d3.format(".2f")(value)
          }
        },
        point: {
          show: false
        },
        size: {
          width: vis.childWidth
        }
      })
      div.insert('h4', ":first-child").text(`Feature ${i}`).attr('class', 'title')
    })

  }
}