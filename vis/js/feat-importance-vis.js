/**
 * This is an object constructor that can be reused as needed
 * The `export default` before the function is necessary so that this can be
 * imported into `main.js`
 *
 * @param _parentElement  -- The ID (no '#') of the `div` element that this vis goes on
 * @param _data           -- Data (as javascript object)
 * @param _config         -- An object containing additional parameters for customization (e.g. 'height', 'width')
 * @constructor
 */
export default function FeatImportanceVis(_parentElement, _data, _config) {
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
FeatImportanceVis.prototype.initVis = function() {
  // Because `this ` is not always accessible in every scope (especially with
  // d3), we save a reference to `this` in the variable `vis` and use that instead.
  var vis = this;

  // Utility function to initialize the vis using the correct div element and
  // configuration settings (from utils.js)
  // E.g. this sets up the margin and SVG, unpacks the config variable
  // If there are extra config variables, they can be accessed later using
  // the syntax `vis.config.<var-name>`
  initVis(vis);

  // Initialize the scales using new D3 v4 syntax (no more scale.band...)
  vis.x = d3.scaleBand().rangeRound([0, vis.width], .05).padding(.05);
  vis.y = d3.scaleLinear().range([vis.height, 0]);

  // Set the domains. Can also be done later
  vis.x.domain(vis.data.map(function(d) { return d.feature; }));
  vis.y.domain([0, d3.max(vis.data, function(d) { return d.value; })]);

  // Initialize the axis generating functions
  vis.xAxis = d3.axisBottom()
      .scale(vis.x);
  vis.yAxis = d3.axisLeft()
      .scale(vis.y)
      .ticks(10);

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
FeatImportanceVis.prototype.renderVis = function() {
  var vis = this;

  vis.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + vis.height + ")")
      .call(vis.xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  vis.svg.append("g")
      .attr("class", "y axis")
      .call(vis.yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("feature importance");

  vis.svg.selectAll("bar")
      .data(vis.data)
      .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", function(d) { return vis.x(d.feature); })
      .attr("width", vis.x.bandwidth())
      .attr("y", function(d) { return vis.y(d.value); })
      .attr("height", function(d) { return vis.height - vis.y(d.value); });
};