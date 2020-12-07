/**
 * LearningCurveVis
 * 
 * Parameters
 *  - parentElement (string): ID of div element
 *  - data (Array): data for the visualization
 *  - config (Object): Additional configuration settings for visualization
 */
class LearningCurveVis extends Vis {
    initVis() {
        var vis = this;

        const trainData = ['Train', ...vis.data.train];
        const testData = ['Test', ...vis.data.test];
        const iterations = ['Iteration', ...Array.from(d3.range(trainData.length))];

        const xTickValues = d3.range(0, trainData.length, 20)

        c3.generate({
            data: {
                columns: [
                    trainData,
                    testData
                ]
            },
            bindto: vis.parentElement,
            axis: {
                x: {
                    label: {
                        text: "Iteration",
                        position: 'outer-center'
                    },
                    tick: {
                      values: xTickValues
                    }
                },
                y: {
                    label: {
                        text: "Loss",
                        position: "outer-middle"
                    }
                },
            },
            tooltip: {
                format: {
                    title: d => `Iteration ${d}`,
                    value: (value, ratio, id) => d3.format(".2f")(value)
                }
            },
            point: {show: false},
            ...vis.c3Defaults
        });
    }
}