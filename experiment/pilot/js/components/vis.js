class Vis {
  constructor(parentElement, data, config) {
    this.parentElement = '#' + parentElement;
    this.data = data;
    this.config = config;

    this.c3Defaults = {
      zoom: {
        enabled: false
      },
      legend: {
        item: {
          onclick: function() {}
        }
      },
      color: {pattern: classColors}
    }

    this.initVis();
  }

  initVis() {};
  
  wrangleData() {};

  updateVis() {};
}