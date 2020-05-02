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
export default function FeatImportanceBubble(_parentElement, _data, _config) {
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
FeatImportanceBubble.prototype.initVis = function () {
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
//   vis.x = d3.scaleBand().rangeRound([0, vis.width], 0.05).padding(0.05);
//   vis.y = d3.scaleLinear().range([vis.height, 0]);

  // Set the domains. Can also be done later
//   vis.x.domain(
//     vis.data.map(function (d) {
//       return d.feature;
//     })
//   );
//   vis.y.domain([
//     0,
//     d3.max(vis.data, function (d) {
//       return d.value;
//     }),
//   ]);

  // Initialize the axis generating functions
 

  vis.diameter = 600;
//   vis.color = d3.scaleOrdinal(d3.schemeCategory20);
  vis.bubble = d3.pack()
      .size([vis.width, vis.height])
      .padding(1.5);

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
FeatImportanceBubble.prototype.renderVis = function () {
  var vis = this;

  console.log("Rendering bubble vis");

  vis.nodes = d3.hierarchy({children: vis.data}).sum(function (d) {
    return d.value;
  });
  vis.bubble(vis.nodes);

 vis.node = vis.svg
    .selectAll("g.node")
    .data(vis.nodes.children)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

    vis.node.append("title").text(function (d) {
      return d.feature + ": " + d.value;
    });

    vis.node
      .append("circle")
      .attr("r", function (d) {
        return d.r;
      })
      .style("fill", "var(--unacceptable)");

  vis.node
    .append("text")
    .attr("dy", ".2em")
    .style("text-anchor", "middle")
    .text(function (d) {
      return d.data.feature.substring(0, d.r / 3);
    })
    .attr("class", "labels")
      .style('fill', 'black');

  vis.node
    .append("text")
    .attr("dy", "1.3em")
    .style("text-anchor", "middle")
    .text(function (d) {
      return format2d(d.data.value);
    })
    .attr("class", "labels")
      .style('fill', 'black');

  // d3.select(self.frameElement).style("height", diameter + "px");
};

