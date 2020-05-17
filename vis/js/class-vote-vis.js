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

  vis.r = 3;
  vis.nPerRow = 5;
  vis.pad = 2;

  // Scales
  vis.x = d3.scaleBand()
      .domain(levels.class)  // Number of classes = 4
      .range([0, vis.width])
      .padding(0);

  vis.y = d3.scaleLinear()
      .domain([0, 100 / vis.nPerRow])
      .range([vis.height - vis.pad, 0]);

  vis.xAxis = d3.axisBottom()
      .scale(vis.x)
      .tickFormat((d, i) => classLabs[i]);

  vis.wrangleData();
};
ClassVoteVis.prototype.wrangleData = function() {
  var vis = this;

  // Get the selected class and pull the counts for that one
  console.log(window.selected.idx);
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

  // Drawing the title
  vis.svg.append('text')
      .attr('class', 'title')
      .text("Number of trees in random forest voting for each class")
      .attr('y', -25);

  // Make groups for each class
  var gClasses = vis.svg.append('g')
      .attr('class', 'all-classes')
      .selectAll('g.class')
      .data(vis.displayData)
      .enter()
      .append('g')
      .attr('class', 'class')
      .attr('transform', d => `translate(${vis.x(d.class) + vis.x.bandwidth() / 2}, 0)`);

  // Draw pictograms
  gClasses.selectAll('circle.dot')
      .data(d => d.count)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => vis.xpos(d, vis))
      .attr('cy', d => vis.ypos(d, vis))
      .style('r', vis.r);

  d3.selectAll('circle.dot')
      .style('fill', classColor(window.selected.class));

  // Draw labels
  var gVoteLabs = vis.svg.append('g')
      .attr('class', 'labels')
      .selectAll('g.vote-label')
      .data(vis.displayData)
      .enter()
      .append('g')
      .attr('class', 'vote-label')
      .attr('transform', d => `translate(${vis.x(d.class) + vis.x.bandwidth() / 2}, ${vis.ypos(d.count.length - 1, vis) - vis.r - vis.pad * 4})`);

  gVoteLabs.append('text')
      .attr('class', 'label')
      .text(d => d.count.length)
      .style('fill', classColor(window.selected.class))
      .attr('x', 0)
      .attr('y', -5)
      .attr('font-size', 12)
      .attr('text-anchor', 'middle');

  // gVoteLabs.append('line')
  //     .attr('class','bar')
  //     .attr('x1', ( -vis.nPerRow * (vis.r * 2 + vis.pad)) / 2)
  //     .attr('x2', (vis.nPerRow * (vis.r * 2 + vis.pad)) / 2)
  //     .attr('y1', 0)
  //     .attr('y2', 0)
  //     .style('stroke', classColor(window.selected.class));

  // Draw axes
  vis.svg.append('g')
      .attr('class', 'axis x-axis grid')
      .attr('transform', `translate(0, ${vis.height + vis.pad})`)
      .call(vis.xAxis);

  vis.svg.selectAll('.tick text')
      .attr('class', 'labels')
      .attr('fill', 'var(--labels)');
};
ClassVoteVis.prototype.xpos = function(d, vis) {
  var i = d % vis.nPerRow,
      // offset = 0;
      offset = (vis.nPerRow) * 3 * (-vis.r + vis.pad) / 2 - vis.r * 2;
  return offset + i * (vis.r * 2 + vis.pad) - vis.pad;
};
ClassVoteVis.prototype.ypos = function(d, vis) {
  return vis.y(Math.floor(d / vis.nPerRow)) - vis.pad;
};