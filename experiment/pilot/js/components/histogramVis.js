class HistogramVis extends Vis {
  initVis() {
    const vis = this;

    console.log(vis.data);

    this.kernel = vis.config.kernel || .7;
    const kernel = kernelEpanechnikov(vis.kernel)
    // Number of features is number of keys that are numeric
    vis.numFeatures = Object.keys(vis.data.train[0]).filter(d => !Number.isNaN(+d)).length
    vis.childWidth = 500;
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

    const outerDiv = d3.select(vis.parentElement)
      .attr('class', 'flex-top-to-bottom carousel-vis');
    const parentDiv = outerDiv
      .append('div')
      .classed('grid', true);
    const legendDiv = outerDiv
      .append('div')
      .style('margin', '50px')

    let xTickValues;
    const allData = [...vis.data.train, ...vis.data.test]
    const charts = [];
    let chart;
    d3.range(vis.numFeatures).forEach(i => {

      const div = parentDiv.append('div');

      const extent = d3.extent(allData, d => d[i]);
      xTickValues = d3.ticks(...extent, 5);

      chart = c3.generate({
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
        },
        ...vis.c3Defaults,
        legend: { show: false }
      })
      div.insert('h4', ":first-child").text(`Feature ${i}`).attr('class', 'title');

      charts.push(chart);
    });

    // Single legend
    const legendDivWidth = legendDiv.node().getBoundingClientRect().width
    const legendItems = legendDiv.append('svg')
      .attr('height', 100)
      .attr('width', legendDivWidth)
      .append('g')
        .attr('class', 'g-legend')
        .attr('transform', `translate(${legendDivWidth / 2},25)`)
      .selectAll('g.c3-legend-item')
      .data(['train', 'test'])
      .enter()
        .append('g')
        .attr('class', d => `c3-legend-item c3-legend-item-${d}`)
        .attr('transform', (d, i) => `translate(${(i - 0.5) * 50},0)`);
    
    legendItems
      .append('text')
      .text(d => d)
      .style('pointer-events', 'none')
      .style('alignment-baseline', 'middle')
    
    legendItems
      .append('line')
      .attr('class', 'c3-legend-item-tile')
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('x1', -15)
      .attr('x2', -5)
      .style('stroke-width', 10)
      .style('point-events', 'none')
      .each(function(d) {
        d3.select(this).style('stroke', charts[0].color(d))
      });

    legendItems
      .append('rect')
      .attr('class', 'c3-legend-item-event')
      .attr('width', d => d.length * 12)
      .attr('height', 20)
      .attr('x', -20)
      .attr('y', -10)
      .style('fill-opacity', 0)
      .on('mouseover', d => charts.forEach(c => c.focus(d)))
      .on('mouseout', () => charts.forEach(c => c.revert()));

  }
}