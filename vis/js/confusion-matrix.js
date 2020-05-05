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
  var height = vis.height,
      width = vis.width,
      length = d3.min([height, width]);
  vis.width = length;
  vis.height = length;

  // Translating it to the middle of the block
  var xOff = (width - length) / 2,
      yOff = (height - length) / 2;
  vis.svg = vis.svg.append('g')
      .attr('transform', `translate(${xOff}, ${yOff})`);

  vis.padding = vis.config.padding || 0.2;

  vis.x = d3.scaleBand()
      .domain([0, 1, 2, 3])
      .range([0, vis.width])
      .padding(vis.padding);
  vis.y = vis.x;


  // Confirm whether this should be linear... is opacity perceptually linear?
  vis.opacity = d3.scaleSqrt()
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

  cells.append('text')
      .attr('class', 'labels')
      .attr('x', vis.x.bandwidth() / 2)
      .attr('y', vis.y.bandwidth() / 2)
      .text(d => d)
      .style('text-anchor', 'middle')
      .style('fill', function(d) {
        var col = 'white';
        if (window.selected.class == 2) {
          if (vis.opacity(d) === 1) {
            col = 'black';
          }
        }
        return col;
      });

  // Adding labels
  var labels = vis.svg.append('g')
      .attr('class', 'labels');

  // True labels (columns)
  labels.append('g')
      .attr('class', 'true-labels')
      .attr('transform', `translate(${vis.x.bandwidth() / 2}, 0)`)
      .selectAll('text.label')
      .data(classLabsAbbrev)
      .enter()
      .append('text')
      .attr('class', 'label')
      .text(d => d)
      .attr('x', (d, i) => vis.x(i))
      .style('text-anchor', 'middle');

  // Predicted labels (rows)
  labels.append('g')
      .attr('class', 'pred-labels')
      .attr('transform', `translate(0, ${vis.y.bandwidth() / 2})`)
      .selectAll('text.label')
      .data(classLabs)
      .enter()
      .append('text')
      .attr('class', 'label')
      .text(d => d)
      .attr('y', (d, i) => vis.y(i))
      .style('text-anchor', 'end');

  // Axis labels
  var gAxisLabs = vis.svg.append('g')
      .attr('class', 'labels');
  gAxisLabs.append('text')
      .text("True class")
      .attr('x', vis.width / 2)
      .attr('y', -12)
      .attr('class', 'axis-label')
      .style('text-anchor', 'middle');
  gAxisLabs.append('text')
      .text("Predicted class")
      .attr('y', -60)
      .attr('x', -vis.height / 2)
      .style('text-anchor', 'middle')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)');

  // Drawing box around predicted class of selected car
  var selectedBox = vis.svg.append('rect')
      .attr('class', 'box-outline')
      .attr('y', vis.y(window.selected.class) - vis.y.bandwidth() * vis.y.padding() / 2)
      .attr('x', 3)
      .attr('height', vis.y.bandwidth() * (1 + vis.y.padding()))
      .attr('width', vis.width - 3 * 2)
      .style('stroke', classColor(window.selected.class));
};
