class ScatterVis extends Vis {
  initVis() {
    var vis = this;

    vis.classes = [...new Set(vis.data.map(d => d.class))];
    vis.aspectRatio = vis.config.aspectRatio || 4 / 3;
    let { width, height } = d3.select(vis.parentElement).node().getBoundingClientRect();
    width = width == 0 ? 600 : width;
    height = height == 0 ? 400 : height;

    if (width > height * vis.aspectRatio) {
      vis.height = height;
      vis.width = height * vis.aspectRatio
    } else {
      vis.width = width;
      vis.height = width / vis.aspectRatio;
    }

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
      size: {
        height: vis.height,
        width: vis.width
      },
      title: {
        text: 'Training data',
        fontsize: 24
      },
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
          label: "Feature 1",
          tick: {
            fit: false
          }
        },
        y: {
          label: "Feature 2"
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
    });

    console.log(vis.height);
    // Adding title
    // d3.select(`${vis.parentElement} svg`)
    // .append('g')
    // .attr('transform', `translate(${vis.width / 2}, 20)`)
    // .append('text')
    // .text('Training data')
    // .attr('class', 'vis-text')
    // .style('text-anchor', 'middle')
  }
}