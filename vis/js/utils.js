function makeSvg(vis) {
  return d3.select('#' + vis.parentElement)
      .append('div')
      .attr('class', 'svg-container ')
      .append('svg')
      .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
      .attr('width', vis.width + vis.margin.left + vis.margin.right)
      .append('g')
      .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')');
}

function initVis(vis) {
  vis.margin = vis.config.margin || {'top': 10, 'bottom': 40, 'left': 40, 'right': 10};

  var $parentElem = $('#' + vis.parentElement);
  vis.width = vis.config.width || $parentElem.width() - vis.margin.left - vis.margin.right;
  vis.height = vis.config.height || $parentElem.height() - vis.margin.top - vis.margin.bottom;

  vis.svg = makeSvg(vis)
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr('x'),
        y = text.attr("y"),
        dy = 0,
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}
