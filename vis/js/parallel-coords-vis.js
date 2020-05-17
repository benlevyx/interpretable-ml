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

  // If aspect ratio is less than 2/3, switch to vertical layout
  // vis.vertical = vis.width / vis.width > 2/3;
  vis.vertical = vis.width < 300;

  vis.selected = window.selected.obs;

  vis.x = d3
    .scalePoint()
    .domain(features.map((d, i) => i));

  if (vis.vertical) {
    vis.x.range([vis.height, 0]);
  } else {
    vis.x.range([0, vis.width]);
  }

  vis.yScales = [];
  vis.yAxes = [];
  features.forEach(column => {
    var y = d3.scaleLinear();
    if (vis.vertical) {
      y.range([0, vis.width]);
    } else {
      y.range([vis.height, 0])
    }
    if (column === 'doors' || column === 'capacity (persons)') {
      y.domain([2, 5])
    } else {
      y.domain([0, levels[column].length - 1])
    }
    var yAxis;
    if (vis.vertical) {
      yAxis = d3.axisTop();
    } else {
      yAxis = d3.axisLeft();
    }
    yAxis.scale(y)
            .ticks(levels[column].length)
            .tickFormat((d, i) => levels[column][i]);

    vis.yScales.push(y);
    vis.yAxes.push(yAxis);
  });

  vis.line = d3
    .line()
    .curve(vis.vertical ? d3.curveMonotoneY : d3.curveMonotoneX)
    .x((d, i) => vis.vertical ? vis.yScales[i](d) : vis.x(i))
    .y((d, i) => vis.vertical ? vis.x(i) : vis.yScales[i](d));

  // Call the function to generate DOM elements
  vis.wrangleData();
};

ParallelCoordsVis.prototype.wrangleData = function() {
  var vis = this;

  // Find the class of the selected datum
  vis.selectedClass = vis.selected.class;
  var selectedIndivData = features.map(f => vis.selected[f]);

  // Filter the data
  var selectedClassData = vis.data.filter(d => d.class === vis.selectedClass);
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
      .attr('transform', (d, i) => vis.vertical ? `translate(0, ${vis.x(i)})` : `translate(${vis.x(i)}, 0)`)
      .each(function(d) { d3.select(this).call(d) });

  // Axis labels
  var axisLabels = vis.svg.append('g')
      .attr('class', 'axis-labels')
      .selectAll('text.axis-label')
      .data(features)
      .enter()
      .append('text')
      .attr('class', 'labels')
      .text(d => featureAbbrevs[d])
      .attr('transform', vis.vertical ? 'translate(-20, -10)' : 'translate(0, 0)')
      .attr(vis.vertical ? 'y' : 'x', (d, i) => vis.x(i))
      .attr(vis.vertical ? 'x' : 'y', vis.vertical ? -12 : vis.height + 7)
      .call(wrap, 10);

  // vis.svg
  //   .selectAll("g.tick > text")
  //   .attr("class", "labels")
  //   .attr("text-anchor", vis.vertical ? 'middle' : "end");
  vis.svg.selectAll('g.tick > text').remove();

  var color = classColor(window.selected.class);

  var lines = vis.svg.append('g')
      .attr('class', 'data-lines')
      .selectAll('path.line')
      .data(vis.displayData)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', d => vis.line(d))
      .style('stroke', color)
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
      .attr(vis.vertical ? 'cy' : 'cx', (d, i) => vis.x(i))
      .attr(vis.vertical ? 'cx' : 'cy', (d, i) => vis.yScales[i](d))
      .style('fill', color);


  var getPos = (d, i) => vis.yScales[vis.vertical ? 0 : 5](vis.displayData[i][vis.vertical ? 0 : 5]);

  var dataLabs = vis.svg.append('g')
      .attr('class', 'data-labels')
      .selectAll('text.data-label')
      .data(['Selected car', `All ${classLabs[window.selected.class]} cars`])
      .enter()
      .append('text')
      .attr('class', 'data-label labels')
      .classed('selected', (d, i) => i === 0)
      .attr(vis.vertical ? 'y' : 'x', vis.vertical ? vis.height : vis.width)
      .attr(vis.vertical ? 'x' : 'y', getPos)
      .style('fill', color)
      .attr('transform', `translate(${vis.vertical ? 0 : 5}, ${vis.vertical ? 10 : -5})`)
      .text(d => d)
      .style('text-anchor', function(d, i) {
        if (!vis.vertical) {
          return 'start';
        } else {
          var thisPos = getPos(d, i),
              otherPos = getPos(d, 1 - i);
          if (thisPos > otherPos) {
            return 'start';
          } else {
            return 'end'
          }
        }
      })
      .call(wrap, 5);
};
