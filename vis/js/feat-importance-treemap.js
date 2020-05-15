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
export default function FeatImportanceTreemap(_parentElement, _data, _config) {
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
FeatImportanceTreemap.prototype.initVis = function () {
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

  vis.opacity = d3.scaleOrdinal(["1", ".9", ".8", ".7", ".6", ".5"]);

  vis.treemap = d3
    .treemap()
    .tile(d3.treemapResquarify)
    .size([vis.width, vis.height])
    .round(true)
    .paddingInner(1);

  vis.displayData = {feature: "root", children: vis.data};

  vis.root = d3
    .hierarchy(vis.displayData)
    .sum((d) => d.value)
    .sort(function (a, b) {
      return b.height - a.height || b.value - a.value;
    });

  vis.treemap(vis.root);

  console.log("treemap", vis.root);
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
FeatImportanceTreemap.prototype.renderVis = function () {
  var vis = this;

    vis.cell = vis.svg.selectAll("g")
      .data(vis.root.leaves())
      .enter().append("g")
        .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

// add rects

    vis.cell.append("rect")
    .attr("id", function(d) { return d.data.feature; })
    .attr("width", function(d) { return d.x1 - d.x0; })
    .attr("height", function(d) { return d.y1 - d.y0; })
    .attr("fill", classColor(window.selected.class));

// add clipPath

  vis.cell
    .append("clipPath")
    .attr("id", function (d) {
      return "clip-" + d.data.feature;
    })
    .append("use")
    .attr("xlink:href", function (d) {
      return "#" + d.data.id;
    });

  // add labels
  
    vis.cell
      .append("text")
      .attr("clip-path", function (d) {
        return "url(#clip-" + d.data.id + ")";
      })
      .selectAll("tspan")
      .data(function (d) {
        return d.data.feature.split(/(?=[A-Z][^A-Z])/g);
      })
      .enter()
      .append("tspan")
      .attr("x", 4)
      .attr("y", function (d, i) {
        return 13 + i * 10;
      })
      .text(function (d) {
        return featureAbbrevs[d];
      })
      .attr("class", "labels")
      .style("fill", "var(--component-card)")
        .call(function(e) {
          e.each(function() {
            var elem = d3.select(this),
                d = elem.data(),
                width = d.x1 - d.x0;
            elem.call(wrap, width);
          })
        })
};
