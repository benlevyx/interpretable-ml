class FeatureImportanceVis extends Vis {
  initVis() {
    var vis = this;
    
    const data = [
      ['x', ...vis.data.map(d => d.feature)],
      ['feature_importance', ...vis.data.map(d => Math.abs(d.value))]
    ];

    vis.chart = c3.generate({
      bindto: vis.parentElement,
      data: {
        columns: data,
        type: 'bar',
        x: 'x'
      },
      bar: {width: {ratio: 0.5}},
      axis: {
        x: {label: 'Feature'},
        y: {label: 'Feature importance'}
      },
      grid: {
        y: {lines: [{value: 0, label: '0'}]}
      },
      tooltip: {
        format: {
          title: d => `Feature ${d}`,
          value: (value, ratio, id) => d3.format(".2f")(value),
          name: () => "Feature importance"
        }
      },
      ...vis.c3Defaults
    })
  }
}