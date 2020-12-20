class ConfusionMatrixVis extends Vis {
  initVis() {
    var vis = this;

    const bbox = d3.select(vis.parentElement).node().getBoundingClientRect();
    vis.margin = {
      top: 60,
      left: 60,
      bottom: 10,
      right: 10
    }
    const length = vis.config.length || 400;
    vis.width = length - vis.margin.left - vis.margin.right;
    vis.height = length - vis.margin.top - vis.margin.bottom;

    makeSvg(vis);

    vis.x = d3.scaleBand()
      .range([0, vis.width])
      .paddingInner(0);
    vis.y = d3.scaleBand()
      .range([0, vis.height])
      .paddingInner(0);
    
    vis.opacity = d3.scaleLinear()
      .range([0, 1])

    // Tooltip
    vis.tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip c3-tooltip-container')
      .style('display', 'none');
    vis.tooltip
      .append('table')
      .attr('class', 'c3-tooltip')
      .html(`
        <tbody>
          <tr>
            <td class="name">True class</td>
            <td class="value" id="true-class"></td>
          </tr>
          <tr>
            <td class="name">Predicted class</td>
            <td class="value" id="pred-class"></td>
          </tr>
          <tr>
            <td class="name">Count</td>
            <td class="value" id="count"></td>
          </tr>
        </tbody>
      `)


    vis.wrangleData();
  }

  wrangleData() {
    var vis = this;

    console.log(vis.data)

    vis.classes = [...new Set(vis.data.map(d => d.class))];
    vis.numClasses = vis.classes.length;

    vis.confMat = vis.classes.map(i => {
      return vis.classes.map(j => {
        const count = vis.data.filter(d => d.pred === i && d.class === j).length;
        return {predClass: i, trueClass: j, count: count};
      })
    })

    vis.x.domain(vis.classes);
    vis.y.domain(vis.classes);
    vis.opacity.domain([0, d3.max(vis.confMat, d => d3.max(d, e => e.count))]);

    vis.updateVis();
  }

  updateVis() {
    var vis = this;

    console.log(vis.confMat)
    const rows = vis.svg.selectAll('g.row')
      .data(vis.confMat);

    let cells = rows
      .enter()
        .append('g')
        .attr('class', 'row')
      .merge(rows)
        .attr('transform', (d, i) => `translate(0,${vis.y(i)})`)
        .selectAll('g.cell')
        .data(d => d);
      
      cells = cells
        .enter()
          .append('g')
          .attr('class', 'cell')
        .merge(cells)
          .attr('transform', (d, i) => `translate(${vis.x(i)},0)`);
      
      cells.append('rect')
        .attr('class', 'cell-rect')
        .attr('width', vis.x.bandwidth())
        .attr('height', vis.y.bandwidth())
        .attr('fill', 'red')
        .attr('opacity', d => vis.opacity(d.count))
        .on('mouseover', (d) => vis.showTooltip(vis, d))
        .on('mouseleave', () => vis.hideTooltip(vis))
        .on('mousemove', () => vis.moveTooltip(vis));
      
      cells.append('text')
        .attr('x', vis.x.bandwidth() / 2)
        .attr('y', vis.y.bandwidth() / 2)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .text(d => d.count)

      cells
        .on('mouseover', function(d) {
          const selection = d3.select(this);
          selection.append('rect')
            .attr('class', 'hover-rect')
            .style('stroke', 'black')
            .style('stroke-width', 3)
            .style('fill', 'none')
            .attr('width', vis.x.bandwidth())
            .attr('height', vis.y.bandwidth())
          selection.select('text')
            .attr('fill', vis.opacity(d.count) >= 0.5 ? 'white' : 'black')
      })
        .on('mouseout', function(d) {
          const selection = d3.select(this);
          selection.selectAll('rect.hover-rect').remove();
          selection.select('text')
            .attr('fill', 'black')
        })
      
      // Labels
      vis.gLabels = vis.svg.append('g')
        .attr('class', 'labels');
      
      ['rows', 'labels'].forEach(cls => {
        vis.gLabels.append('g')
          .attr('class', cls)
          .selectAll('text.label')
          .data(vis.classes)
          .enter()
          .append('text')
          .attr('class', 'label')
          .attr('transform', (d, i) => cls === 'rows'
                                       ? `translate(-10, ${vis.y(i) + vis.y.bandwidth() / 2}) rotate(-90)`
                                       : `translate(${vis.x(i) + vis.x.bandwidth() / 2},-10)`)
          .text(d => `Class ${d}`);
      })

      // Titles
      vis.gLabels.append('text')
        .attr('class', 'title')
        .text('True class')
        .attr('transform', `translate(${vis.width / 2},-30)`)
      
      vis.gLabels.append('text')
        .attr('class', 'title')
        .text('Predicted class')
        .attr('transform', `translate(-30, ${vis.height / 2}) rotate(-90)`)
  }

  showTooltip(vis, d, arr) {
    vis.tooltip.style('display', 'block')
    vis.tooltip.select('#true-class').text(d.trueClass)
    vis.tooltip.select('#pred-class').text(d.predClass)
    vis.tooltip.select('#count').text(d.count)
  }

  hideTooltip(vis) {
    vis.tooltip
      .style('display', 'none')
  }

  moveTooltip(vis) {
    vis.tooltip
      .style('top', (d3.event.pageY + 10) + "px")
      .style('left', (d3.event.pageX + 10) + "px")
  }
}