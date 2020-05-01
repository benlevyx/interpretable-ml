//TODO: Flip this vis so that it becomes "of all cars with the same class as the predicted car,
// what is the average value for each of the features?
/**
 * ParallelCoordsVis. Object constructor function
 *
 * @param _parentElement  -- The ID (no '#') of the `div` element that this vis goes on
 * @param _data           -- Data (as javascript object)
 * @param _config         -- An object containing additional parameters for customization (e.g. 'height', 'width')
 * @constructor
 */
export default function ParallelCoordsVis(_parentElement, _data, _config) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = null;
  this.config = _config;

  this.initVis();
}

/**
 * Initialize the basic features of the vis
 *    - Scales
 *    - SVG and margin
 */
ParallelCoordsVis.prototype.initVis = function () {
  var vis = this;

  initVis(vis);

  vis.selected = vis.config.selected;

  vis.x = d3
    .scalePoint()
    .domain(features.map((d, i) => i))
    .range([0, vis.width]);

  vis.yScales = [];
  vis.yAxes = [];
  features.forEach(column => {
    var y = d3.scaleOrdinal()
            .domain(levels[column])
            .range([vis.height, 0]),
        yAxis = d3.axisLeft()
            .scale(y)
            .ticks(levels[column].length)
            .tickFormat((d, i) => levels[column][i]);

    vis.yScales.push(y);
    vis.yAxes.push(yAxis);
  });

  // Change y accessor after doing the grouping.
  vis.line = d3
    .line()
    .curve(d3.curveNatural)
    .x((d, i) => vis.x(i))
    .y((d, i) => vis.yScales[i](d));

  // Call the function to generate DOM elements
  vis.wrangleData();
};

ParallelCoordsVis.prototype.wrangleData = function() {
  var vis = this;

  // Find the class of the selected datum
  var selected = vis.data.find((d, i) => i === vis.selected),
      selectedIndivData = features.map(f => selected[f]);

  // Filter the data
  var selectedClassData = vis.data.filter(d => d.class === selected.class);
  console.log(selectedClassData);
  var selectedClassMeans = features.map(f => d3.mean(selectedClassData, d => d[f]));

  vis.displayData = [
      selectedIndivData,
      selectedClassMeans
  ];

  vis.updateVis();
};

/**
 * Draw the visual elements in the DOM
 */
ParallelCoordsVis.prototype.updateVis = function () {
  var vis = this;

  // Axes
  var axes = vis.svg.append('g')
      .attr('class', 'axes y-axes')
      .selectAll('g.axis.y-axis')
      .data(vis.yAxes)
      .enter()
      .append('g')
      .attr('class', 'axis y-axis grid')
      .attr('transform', (d, i) => `translate(${vis.x(i)}, 0)`)
      .call(d => d)
      .append('text')
      .style('text-anchor', 'middle')
      .attr('y', vis.height)
      .attr('x', 0)
      .attr('transform', 'translate(0, 7)')
      .text((d, i) => capitalizeFirstLetter(features[i]))
      .call(wrap, 20)
      .attr('class', 'labels');

  vis.svg
    .selectAll("g.tick > text")
    .attr("class", "labels")
    .attr("text-anchor", "end");

  var lines = vis.svg.append('g')
      .attr('class', 'data-lines')
      .selectAll('path.line')
      .data(vis.displayData)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', d => vis.line(d))
      .classed('selected', (d ,i) => i === 0);

  var markers = vis.svg
      .append('g')
      .attr('class', 'markers')
      .selectAll('g.marker-group')
      .data(vis.displayData)
      .enter()
      .append('g')
      .attr('class', 'marker-group')
      .classed('selected', (d, i) => i === 0)
      .selectAll('circle.marker')
      .data(d => d)
      .enter()
      .append('circle')
      .attr('class', 'marker')
      .attr('cx', (d, i) => vis.x(i))
      .attr('cy', (d, i) => vis.yScales[i](d));
};

function objToArr(obj) {
  var copy = Object.assign({}, obj);
  if (copy.selected !== undefined) {
    delete copy.selected;
  }
  return Object.entries(copy);
}