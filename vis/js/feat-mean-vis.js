//TODO: Flip this vis so that it becomes "of all cars with the same class as the predicted car,
// what is the average value for each of the features?
/**
 * FeatMeanVis. Object constructor function
 *
 * @param _parentElement  -- The ID (no '#') of the `div` element that this vis goes on
 * @param _data           -- Data (as javascript object)
 * @param _config         -- An object containing additional parameters for customization (e.g. 'height', 'width')
 * @constructor
 */
export default function FeatMeanVis(_parentElement, _data, _config) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.config = _config;

  this.initVis();
}

/**
 * Initialize the basic features of the vis
 *    - Scales
 *    - SVG and margin
 */
FeatMeanVis.prototype.initVis = function () {
  // Because `this ` is not always accessible in every scope (especially with
  // d3), we save a reference to `this` in the variable `vis` and use that instead.
  var vis = this;

  // Utility function to initialize the vis using the correct div element and
  // configuration settings (from utils.js)
  // E.g. this sets up the margin and SVG, unpacks the config variable
  // If there are extra config variables, they can be accessed later using
  // the syntax `vis.config.<var-name>`
  initVis(vis);

  console.log(vis.data.features.length);
  vis.x = d3
    .scalePoint()
    .domain(vis.data.features.map((d, i) => i))
    .range([0, vis.width]);

  vis.y = d3
    .scaleLinear()
    .domain([0, 3]) // Number of classes
    .range([vis.height, 0]);

  vis.yAxis = d3
    .axisLeft()
    .scale(vis.y)
    .ticks(4)
    .tickFormat((d, i) => classLabs[i]);

  vis.line = d3
    .line()
    .curve(d3.curveNatural)
    .x((d, i) => vis.x(i))
    .y((d) => vis.y(d));

  // Call the function to generate DOM elements
  vis.renderVis();
};

/**
 * Draw the visual elements in the DOM
 *
 * This function can be modified as necessary. E.g. any classes to apply
 * element styling should be added here. I recommend doing selection/filtering
 * or annotation in a separate function and to keep this function as purely
 * about drawing the basic marks and axes. That way, we can easily render
 * versions with and without highlighting, annotation, etc.
 */
FeatMeanVis.prototype.renderVis = function () {
  var vis = this;

  // Axes
  // var lines = vis.svg.append('g')
  //     .attr('class', 'lines')
  //     .selectAll('line.axis')
  //     .data(vis.data.features)
  //     .enter()
  //     .append('line')
  //     .attr('class', 'axis')
  //     .attr('x1', (d, i) => vis.x(i))
  //     .attr('x2', (d, i) => vis.x(i))
  //     .attr('y1', 0)
  //     .attr('y2', vis.height)
  //     .style('stroke', 'var(--grid)')
  //     .style('stroke-width', 1);
  console.log(vis.data.features);
  var axes = vis.svg
    .append("g")
    .attr("class", "axes")
    .selectAll("g.axis")
    .data(vis.data.features)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${vis.x(i)}, 0)`)
    .attr("class", "axis grid")
    .each(function (d, i) {
      drawAxis(d3.select(this), vis, i);
    })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", vis.height)
    .attr("x", 0)
    .attr("transform", "translate(0, 7)")
    .text((d) => capitalizeFirstLetter(d))
    .style("fill", "var(--labels)")
    .call(wrap, 20)
    .attr("class", "labels");

  vis.svg
    .selectAll("g.tick > text")
    .attr("class", "labels")
    .attr("text-anchor", "end");

  var dataLine = vis.svg
    .append("path")
    .datum(vis.data.values)
    .attr("class", "data-line")
    .attr("d", (d) => {
      console.log(d);
      return vis.line(d);
    })
    .style("stroke", "var(--white)")
    .style("fill", "none")
    .style("opacity", 0.8);

  var markers = vis.svg
    .append("g")
    .attr("class", "markers")
    .selectAll("circle.marker")
    .data(vis.data.values)
    .enter()
    .append("circle")
    .attr("class", "marker-line")
    .attr("cx", (d, i) => vis.x(i))
    .attr("cy", (d) => vis.y(d))
    .attr("stroke", "none")
    .attr("fill", "var(--white)")
    .attr("r", 3)
    .style("opacity", 0.8);

  vis.annotate();
};
FeatMeanVis.prototype.annotate = function () {
  var vis = this;

  if (vis.config.selected) {
    vis.svg
      .append("line")
      .attr("class", "annotation")
      .attr("x1", 0)
      .attr("x2", vis.width)
      .attr("y1", vis.y(vis.config.selected.value))
      .attr("y2", vis.y(vis.config.selected.value));

    vis.svg
      .append("text")
      .attr("x", vis.width)
      .attr("y", vis.y(vis.config.selected.value))
      .attr("transform", "translate(4, -2)")
      .attr("class", "annotation")
      .attr("class", "labels annotation")
      .text(vis.config.selected.label)
      .call(wrap, vis.margin.right);
  }
};

function drawAxis(elem, vis, i) {
  if (i > 0) {
    vis.yAxis.tickFormat("");
  }
  elem.call(vis.yAxis);
}
