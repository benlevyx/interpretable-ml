class ScatterVis extends Vis {
  initVis() {
    var vis = this;

    vis.classes = [...new Set(vis.data.map(d => d.class))];

    // PCA projection
    const points = vis.data.map(d => {
      return d3.range(4).map(i => d[i])
    })
    const eigenvectors = PCA.getEigenVectors(points);
    const pcaScoresX = PCA.computeAdjustedData(points, eigenvectors[0]).adjustedData[0]
    const pcaScoresY = PCA.computeAdjustedData(points, eigenvectors[1]).adjustedData[0]

    const displayData = [];
    const xs = {};
    vis.classes.forEach(cls => {
      const xName = `Class ${cls}_x`;
      const yName = `Class ${cls}`
      xs[yName] = xName;
      displayData.push([xName, ...pcaScoresX.filter((d, i) => vis.data[i].class === cls)]);
      displayData.push([yName, ...pcaScoresY.filter((d, i) => vis.data[i].class === cls)]);
    })

    console.log(xs);
    console.log(displayData);

    vis.chart = c3.generate({
      bindto: vis.parentElement,
      data: {
        xs: xs,
        columns: displayData,
        type: 'scatter'
      },
      axis: {
        x: {
          label: "Dimension 1",
          tick: {
            fit: false
          }
        },
        y: {
          label: "Dimension 2"
        }
      },
      tooltip: {
        format: {
          title: d => d3.format(".2f")(d),
          value: (value, ratio, id) => d3.format(".2f")(value)
        }
      },
      ...vis.c3Defaults
    })
  }
}