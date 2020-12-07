function makeSvg(vis) {
  vis.margin = vis.margin || { top: 20, bottom: 40, left: 40, right: 20 };
  vis.width = vis.width || d3.select(vis.parentElement).node().getBoundingClientRect().width - vis.margin.left - vis.margin.right;
  vis.height = vis.height || 400 - vis.margin.top - vis.margin.bottom;

  vis.svg = d3.select(vis.parentElement)
    .append('svg')
      .attr('width', vis.width + vis.margin.left + vis.margin.right)
      .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
    .append('g')
      .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`)
}


/**
 * From: https://www.d3-graph-gallery.com/graph/density_double.html
 * @param {Number} kernel 
 * @param {Array} X 
 */
function kernelDensityEstimator(kernel, X) {
  return function(V) {
    return X.map(function(x) {
      return d3.mean(V, function(v) { return kernel(x - v); });
    });
  };
}
function kernelEpanechnikov(k) {
  return function(v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}
