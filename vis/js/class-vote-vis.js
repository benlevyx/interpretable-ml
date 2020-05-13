/**
 * Simple vertical or horizontal pictogram chart (using circles or squares) to denote
 * individual trees voting for a given class
 * @param _parentElem
 * @param _data
 * @param _config
 * @constructor
 */
export default function ClassVoteVis(_parentElem, _data, _config) {
  this.parentElement = _parentElem;
  this.data = _data;
  this.displayData = _data;
  this.config = _config;

  this.initVis()
};
ClassVoteVis.prototype.initVis = function() {
  var vis = this;

  initVis(vis);

  vis.r = 5;
  vis.nPerRow = 4;
  vis.pad = 2;

  // Scales
  vis.x = d3.scaleBand()
      .domain(levels.class)  // Number of classes = 4
      .range([0, vis.width])
      .padding(0.1);

  vis.y = d3.scaleLinear()
      .domain([0, 100 / vis.nPerRow])
      .range([vis.height, 0]);

  vis.wrangleData();
};
ClassVoteVis.prototype.wrangleData = function() {
  var vis = this;

  // Get the selected class and pull the counts for that one
  var selectedData = vis.data.find(d => d.idx === window.selected.idx);

  vis.displayData = levels.class.map(c => {
    var votes = d3.range(selectedData[c]);
    return {class: c, count: votes};
  });

  console.log(vis.displayData);
  vis.updateVis();
};
ClassVoteVis.prototype.updateVis = function() {
  var vis = this;

  // Make groups for each class
  var gClasses = vis.svg.append('g')
      .attr('class', 'all-classes')
      .selectAll('g.class')
      .data(vis.displayData)
      .enter()
      .append('g')
      .attr('class', 'class')
      .attr('transform', d => `translate(${vis.x(d.class)}, 0)`);

  // Draw pictograms
  gClasses.selectAll('circle.marker')
      .data(d => d.count)
      .enter()
      .append('circle')
      .attr('class', 'marker')
      .attr('cx', d => vis.xpos(d, vis))
      .attr('cy', d => vis.ypos(d, vis))
      .style('r', 3);

  d3.selectAll('circle.marker')
      .style('fill', classColor(window.selected.class));
  // Draw labels

  // Draw axes
};
ClassVoteVis.prototype.xpos = function(d, vis) {
  var i = d % vis.nPerRow,
      offset = (vis.nPerRow - 1) * (-vis.r + vis.pad) / 2;
  return offset + i * (vis.r + vis.pad);
};
ClassVoteVis.prototype.ypos = function(d, vis) {
  return vis.y(Math.floor(d / vis.nPerRow)) + vis.pad;
};