class ScatterVis extends Vis {
  initVis() {
    var vis = this;

    vis.classes = [...new Set(vis.data.map(d => d.class))];

    const numFeatures = Object.keys(vis.data).filter(k => !isNaN(+k)).length;
    // PCA projection
    // const points = vis.data.map(d => {
    //   return d3.range(4).map(i => d[i])
    // });
    // const eigenvectors = PCA.getEigenVectors(points),
    //       pcaScoresX = PCA.computeAdjustedData(points, eigenvectors[0]).adjustedData[0],
    //       pcaScoresY = PCA.computeAdjustedData(points, eigenvectors[1]).adjustedData[0]

    const pc1 = vis.data.map(d => d.pc1),
          pc2 = vis.data.map(d => d.pc2);

    const displayData = [],
          xs = {};
    vis.classes.forEach(cls => {
      const xName = `Class ${cls}_x`;
      const yName = `Class ${cls}`
      xs[yName] = xName;
      displayData.push([xName, ...pc1.filter((d, i) => vis.data[i].class === cls)]);
      displayData.push([yName, ...pc2.filter((d, i) => vis.data[i].class === cls)]);
    })

    console.log(xs);
    console.log(displayData);

    vis.chart = c3.generate({
      bindto: vis.parentElement,
      data: {
        xs: xs,
        columns: displayData,
        type: 'scatter',
        colors: {
          "Class 0": "blue",
          "Class 1": "red"
        }
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
      point: {
        r: 5
      },
      ...vis.c3Defaults
    })
  }
}