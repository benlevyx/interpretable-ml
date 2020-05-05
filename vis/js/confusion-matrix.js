/**
 *
 * @param _parentElem
 * @param _data
 * @param _config
 * @constructor
 */
export default function ConfusionMatrix(_parentElem, _data, _config) {
  this.parentElement = _parentElem;
  this.data = _data;
  this.config = _config;

  this.initVis()
};
ConfusionMatrix.prototype.initVis = function() {
  var vis = this;

  initVis(vis);

  // Ensuring square (is this necessary)
  var length = d3.min([vis.height, vis.width]);
  vis.width = length;
  vis.height = length;

  vis.padding = vis.config.padding || 0.2;

  vis.x = d3.scaleBand()
      .domain([0, 1, 2, 3])
      .range([0, vis.width])
      .padding(vis.padding);
  vis.y = vis.x;


  // Confirm whether this should be linear... is opacity perceptually linear?
  vis.opacity = d3.scaleLinear()
      .range([0, 1]);

  vis.wrangleData();
};
ConfusionMatrix.prototype.wrangleData = function() {
  var vis = this;

  var minVal = d3.min(vis.data, d => d3.min(d)),
      maxVal = d3.max(vis.data, d => d3.max(d));

  vis.opacity.domain([minVal, maxVal]);

  vis.updateVis();
};
ConfusionMatrix.prototype.updateVis = function() {
  var vis = this;

  var cells = vis.svg.append('g')
      .attr('class', 'blocks')
      .selectAll('g.row')
      .data(vis.data)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', (d, i) => `translate(0, ${vis.y(i)})`)
      .selectAll('g.cell')
      .data(d => d)
      .enter()
      .append('g')
      .attr('class','cell')
      .attr('transform', (d, i) => `translate(${vis.x(i)}, 0)`);

  cells.append('rect')
      .attr('class', 'block')
      .style('opacity', vis.opacity)
      .attr('x', vis.padding)
      .attr('y', vis.padding)
      .attr('height', vis.y.bandwidth())
      .attr('width', vis.x.bandwidth())
      .style('fill', classColor(window.selected.class));
};
