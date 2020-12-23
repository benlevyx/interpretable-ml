class HistogramVis extends Vis {
  initVis() {
    const vis = this;

    console.log(vis.data);

    this.kernel = vis.config.kernel || .7;
    const kernel = kernelEpanechnikov(vis.kernel)
    // Number of features is number of keys that are numeric
    vis.numFeatures = Object.keys(vis.data.train[0]).filter(d => !Number.isNaN(+d)).length
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

    const parentDiv = d3.select(vis.parentElement)
      .classed('grid', true);

    let xTickValues;
    const allData = [...vis.data.train, ...vis.data.test]
    d3.range(vis.numFeatures).forEach(i => {

      const div = d3.select(vis.parentElement).append('div');

      const extent = d3.extent(allData, d => d[i]);
      xTickValues = d3.ticks(...extent, 5);

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
        point: {show: false},
        size: {width: vis.childWidth},
        padding: {
          top: 40,
          bottom: 40,
          left: 40,
          right: 40
        },
        axis: {
          x: {
            tick: {
              values: xTickValues
            }
          }
        }
      })
      div.insert('h4', ":first-child").text(`Feature ${i}`).attr('class', 'title')
    })

  }
}