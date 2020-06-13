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
  this.data = _data.carData;
  this.featImportances = _data.featImportances
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
    .scalePoint();

  if (vis.vertical) {
    vis.x.range([vis.height, 0]);
  } else {
    vis.x.range([0, vis.width]);
  }

  vis.yScales = {};
  vis.yAxes = {};
  features.forEach(column => {
    var y = d3.scaleLinear();
    if (vis.vertical) {
      y.range([0, vis.width]);
    } else {
      y.range([vis.height, 0])
    }
    var ymin = d3.min(encodedLevels[column]),
        ymax = d3.max(encodedLevels[column]);
    y.domain([ymin, ymax]);
    var yAxis;
    if (vis.vertical) {
      yAxis = d3.axisTop();
    } else {
      yAxis = d3.axisLeft();
    }
    yAxis.scale(y)
            .ticks(levels[column].length)
            .tickFormat((d, i) => levels[column][i]);

    vis.yScales[column] = y;
    vis.yAxes[column] = yAxis;

    // Radius scale for marker size (feature importance)
    vis.r = d3.scaleSqrt()
        .range([2, 8])
        .domain(d3.extent(vis.featImportances, d => d.value))
  });

  vis.line = d3
    .line()
    .curve(vis.vertical ? d3.curveMonotoneY : d3.curveMonotoneX);

  // Call the function to generate DOM elements
  vis.wrangleData();
};

ParallelCoordsVis.prototype.wrangleData = function() {
  var vis = this;

  // Find the class of the selected datum
  var selectedIndivData = features.map(f => {
    return {feature: f, value: vis.selected[f]};
  });

  // Filter the data
  var selectedClassData = vis.data.filter(d => d.class === vis.selected.class),
      selectedClassMeans = features.map(f => {
    return {feature: f, value: d3.mean(selectedClassData, d => d[f])}
  });

  vis.displayData = [
    selectedIndivData,
    selectedClassMeans
  ];

  console.log(vis.displayData);

  // Converting feat importances into a dictionary mapping from
  // feature name to feature value
  vis.featImportanceDict = {};
  vis.featImportances.forEach(d => {
    vis.featImportanceDict[d.feature] = d.value;
  });

  // Getting features in order of importance
  vis.featsOrdered = features.sort((a, b) => {
    return vis.featImportanceDict[a] < vis.featImportanceDict[b];
  })

  vis.x.domain(vis.featsOrdered.map(d => d))

  vis.line
      .x(d => vis.vertical ? vis.yScales[d.feature](d.value) : vis.x(d.feature))
      .y(d => vis.vertical ? vis.x(d.feature) : vis.yScales[d.feature](d.value))

  vis.updateVis();
};

/**
 * Draw the visual elements in the DOM
 */
ParallelCoordsVis.prototype.updateVis = function () {
  var vis = this;

  addTitle(vis);

  // Axes
  var axes = vis.svg.append('g')
      .attr('class', 'axes y-axes')
      .selectAll('g.axis.y-axis')
      .data(vis.featsOrdered)
      .enter()
      .append('g')
      .attr('class', 'axis y-axis grid')
      .attr('transform', (d, i) => vis.vertical ? `translate(0, ${vis.x(d)})` : `translate(${vis.x(d)}, 0)`)
      .each(function(d) { d3.select(this).call(vis.yAxes[d]) });

  // Axis labels
  var axisLabels = vis.svg.append('g')
      .attr('class', 'axis-labels')
      .selectAll('text.axis-label')
      .data(vis.featsOrdered)
      .enter()
      .append('text')
      .attr('class', 'labels')
      .text(d => featureAbbrevs[d])
      .attr('transform', vis.vertical ? 'translate(0, -10)' : 'translate(0, 0)')
      .attr(vis.vertical ? 'y' : 'x', d => vis.x(d))
      .attr(vis.vertical ? 'x' : 'y', vis.vertical ? -12 : vis.height + 7)
      .call(wrap, 10)
      .attr('text-anchor', 'end');

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
      .attr(vis.vertical ? 'cy' : 'cx', d => vis.x(d.feature))
      .attr(vis.vertical ? 'cx' : 'cy', d => vis.yScales[d.feature](d.value))
      .style('fill', color);
  if (vis.config.featImportanceDiameter) {
    markers.style('r', d => vis.r(vis.featImportanceDict[d.feature]));
  }

  function getPos(d, i) {
    var endIdx = vis.vertical ? 0 : 5,
        endFeat = vis.featsOrdered[endIdx],
        res = vis.yScales[endFeat](vis.displayData[i][endIdx].value);
    console.log(res);
    return res;
  }

  var dataLabs = vis.svg.append('g')
      .attr('class', 'data-labels')
      .selectAll('text.data-label')
      .data(['Selected car', `All ${classLabs[vis.selected.class]} cars`])
      .enter()
      .append('text')
      .attr('class', 'data-label labels')
      .classed('selected', (d, i) => i === 0)
      .attr(vis.vertical ? 'y' : 'x', vis.vertical ? vis.height : vis.width)
      .attr(vis.vertical ? 'x' : 'y', getPos)
      .style('fill', color)
      .attr('transform', `translate(${vis.vertical ? 0 : 10}, ${vis.vertical ? 10 : -5})`)
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
