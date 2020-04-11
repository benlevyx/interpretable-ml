/**
 * This is an object constructor that can be reused as needed
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
  var vis = this;

  // Utility function to initialize the vis using the correct div element and
  // configuration settings (from utils.js)
  initVis(vis);

  vis.x = d3.scaleBand().rangeRound([0, vis.width], .05).padding(.05);
  vis.y = d3.scaleLinear().range([vis.height, 0]);

  vis.x.domain(vis.data.map(function(d) { return d.feature; }));
  vis.y.domain([0, d3.max(vis.data, function(d) { return d.value; })]);

  vis.xAxis = d3.axisBottom()
      .scale(vis.x);

  vis.yAxis = d3.axisLeft()
      .scale(vis.y)
      .ticks(10);

  vis.renderVis();

  console.log(vis.data);
};

/**
 * Draw the visual elements in the DOM
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