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

  vis.diameter = 600;


  vis.bubble = d3.pack()
      .size([vis.width, vis.height])
      .padding(1.5);

  vis.stack = d3.stack()
      .keys(["value"]);

  if (vis.width / vis.height < 2 / 3) {
    vis.vertical = true;
  } else if (vis.width / vis.height > 3 / 2) {
    vis.horizontal = true;
  }
  if (vis.vertical || vis.horizontal) {
    console.log(vis.vertical ? "vertical" : "horizontal");

    var extent;
    if (vis.vertical) {
      extent = vis.height;
    } else {
      extent = vis.width;
    }
    vis.r = d3.scaleLinear()
        .domain([0, 1])
        .range([0, extent / 2]);

    vis.scale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, extent]);
  }


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

  if (vis.vertical || vis.horizontal) {
    var stacked = vis.stack(vis.data)[0];
    vis.nodes = [];

    stacked.forEach((d, i) => {
      var tprev = vis.nodes[i-1] || [0, 0];
      vis.nodes[i] = [d[0] + tprev[1], d[1] + tprev[1]];
      vis.nodes[i].data = d.data;
    });
  } else {
    vis.nodes = d3.hierarchy({children: vis.data}).sum(function (d) {
      return d.value;
    });
    vis.bubble(vis.nodes);
  }

 vis.node = vis.svg
    .selectAll("g.node")
    .data(vis.vertical || vis.horizontal ? vis.nodes : vis.nodes.children)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d, i) {
      if (vis.vertical) {
        return `translate(${vis.width / 2}, ${vis.scale((d[0] + d[1]) / 2)})`
      } else if (vis.horizontal) {
        return `translate(${vis.scale((d[0] + d[1]) / 2)}, ${vis.height / 2})`
      } else {
        return "translate(" + d.x + "," + d.y + ")";
      }
    });

    vis.node.append("title").text(function (d) {
      if (vis.vertical || vis.horizontal) {
        return `${d.data.feature}: ${d.data.value}`;
      } else {
        return d.feature + ": " + d.value;
      }
    });

    vis.node
      .append("circle")
      .attr("r", function (d) {
        if (vis.vertical || vis.horizontal) {
          return vis.r(d[1] - d[0]);
        } else {
          return d.r;
        }
      })
      .style("fill", classColor(window.selected.class));

      vis.node
          .append("text")
          .attr("dy", ".2em")
          .style("text-anchor", "middle")
          .html(function (d) {
            return `<tspan x="0" dy="0em">${featureAbbrevs[d.data.feature]}</tspan>` +
                   `<tspan x="0" dy="1.0em">${format2d(d.data.value)}</tspan>`;
          })
          .attr("class", "labels")
          .call(placeLabel, vis);

      // vis.node
      //     .append("text")
      //     .attr("dy", "1.3em")
      //     .style("text-anchor", "middle")
      //     .text(function (d) {
      //       return format2d(d.data.value);
      //     })
      //     .attr("class", "labels")
      //     .call(placeLabel, vis);
};
function placeLabel(text, vis) {
  text.each(function() {
    var elem = d3.select(this);
    if (vis.vertical || vis.horizontal) {
      var width = elem.node().getBBox().width,
          d = elem.data()[0],
          diam = vis.r(d[1] - d[0]) * 2;
      console.log(d);
      console.log(diam);
      if (width > diam - 2) {
        // Then place it outside the circle
        if (vis.vertical) {
          // Move it to the right
          elem.attr('transform', `translate(${20}, 0)`)
              .style('text-anchor', 'start');
        } else {
          // Move it down
          elem.attr('transform', `translate(0, ${20})`);
        }
      } else {
        elem.style('fill', 'black');
      }
    }
    else {
        // Keep it where it is and make it black
        elem.style('fill', 'black');
    }
  })
}

