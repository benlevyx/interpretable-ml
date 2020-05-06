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
export default function FeatImportancePie(_parentElement, _data, _config) {
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
FeatImportancePie.prototype.initVis = function () {
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

  vis.radius = Math.min(vis.width, vis.height) / 2;

  vis.opacity = d3.scaleOrdinal(["1",".9",".8",
         ".7",".6",".5"]);

  vis.pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null);

  vis.arc = d3.arc().innerRadius(0).outerRadius(vis.radius);

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
FeatImportancePie.prototype.renderVis = function () {
  var vis = this;
  vis.svg.attr("transform", `translate(${vis.width / 2}, ${vis.height / 2})`);


  vis.arcs = vis.svg
    .selectAll("g.slice")
    .data(vis.pie(vis.data))
    .enter()
    .append("g")
    .attr("class", "slice");

  vis.arcs
    .append("path")
    .attr("d", vis.arc)
    .attr("fill", classColor(window.selected.class))
    .attr("opacity",(d, i) => vis.opacity(i) )

  vis.arcs
    .append("text")
    .attr("transform", function (d) {
      d.innerRadius = 0;
      d.outerRadius = vis.radius;
      return "translate(" + vis.arc.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .text(function (d, i) {
      return vis.data[i].feature;
    })
    .attr("class", "labels")
      .style('fill', 'var(--component-card)');
};
