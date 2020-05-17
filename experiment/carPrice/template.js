/**
 * LabintheWild study template
 *
 * authors: Krzysztof Gajos
 */


// global debug variable
var debug = 1;

// global progress bar variable (could be made private)
var progressBar = null;
var currentCar = 0;
var maxCars = 55;
var REWARD_INTERVAL = 5;
var arrangements = {};
var taskTime = {};
var variant = ((Math.random() > 0.5) ? 1 : 0); // randomize experiment variable
var decisionBatch = []; // array of user decisions of a certain length. When reaching the length the reward is calculated as the mean and this array will be empty again. 
var accuracyBatch = [];
var IAHistory = {
};

var tutorialsShown = {
    "tut": false,
    "opt": false,
    "eval": false
}

function sampleTest() {
    var startTime;
    var initializeUI = function() {
        var intro = introJs();
        intro.setOptions({
          steps: [
            {
                element: "#prediction",
                intro: "Here is the AI's prediction."
            },    
            {
                element: "#features",
                intro: "Here are the features of this car."
              },       
            {
                element: "#dynamicIA",
                intro: "You will decide based on this dashboard design that entails how the AI makes these decisions. This dashboard may change depends on how you and the AI system perform in this task."
            },  
            {
                element: "#decisions",
                intro: "Indicate your choices here."
            },
            { 
                intro: "Next 5 cars will be tutorials :)"
              },
    
          ],
          showStepNumbers:false
        });
        var opt = introJs();
        opt.setOptions({
          steps: [{intro: "the real optimiazation starts"},],
          showStepNumbers:false
        });
        var evaluation = introJs();
        evaluation.setOptions({
          steps: [{intro: "the evaluation starts"},],
          showStepNumbers:false
        });

        // TODO configure progress bar
        progressBar = progress(); // creating progressBar object
        // defining the steps in the study and the page IDs that they correspond to
        progressBar.addStep("Consent", "#consent_page", 1, 1) // the first number indicates how much space this step should take visually
            .addStep("About you", "#demographics_page", 1, 1) // the second number indicates how many substeps are in that stage
            .addStep("The test", "#instructions_page", 4, 20) // see utils/js/progress.js for more documentation
            .addStep("Final questions", "#comments_page", 1, 1)
            .addStep("Results!", "#results_page", 0, 1);

        // TODO the lines below capture the flow through the experiment; most likely you will need to change some of it
        $("#splash_button").click(function () {
            viewPage("#consent_page");
            // displaying progress bar and initializing it to the first step (informed consent)
            progressBar.initialize("#progressBar", 800).activateStep("#consent_page");
        });
        $("#consent_button").click(function () {
            viewPage("#demographics_page")
        });
        $("#demographics_button").click(function () {
            viewPage("#instructions_page")
        });
        $("#instructions_button").click(function () {
            variant = $("#variant").val()
            viewPage("#experiment2_page");
            startTime = new Date();
            // visually show that progress has been made through "The test" step on the progress bar
            progressBar.incrementStepProgress();

        });
        $("#experiment2_button").click(function () {
            viewPage("#comments_page");
            // visually show that progress has been made through "The test" step on the progress bar
            progressBar.incrementStepProgress();
        });
        $("#comments_button").click(function () {
            viewPage("#results_page");
            // we do not really need the progress bar on the results page so we make it disappear
            $("#progressBar").slideUp(2000);
        });

        $(".decisionBtt").click(
            clickDecisionBtt
        );

        
        function clickDecisionBtt() {
            currentCar += 1;
            if(currentCar > maxCars) {
                viewPage("#comments_page");
                $.ajax({
                    url : "./data.php",
                    type : "POST",
                    data: {
                        accuracy: JSON.stringify({
                            participant_id: participantID,
                            variant: variant,
                            accuracies: JSON.stringify(accuracyBatch),
                        
                        }
                            
                            )
                        },
                    success: function(result) {
                        console.log("uploaded accuracy");

                    }
                });
                return;
            }

            var time = new Date() - startTime;
            startTime = new Date()
            var r = 0;
            if($(this).attr('id') === "agreeBtt"){
                r = 1;
            }

            console.log(r);
            console.log(window.selected.obs['class'] === window.selected.obs['class_pred']);
            console.log(window.selected.obs['class'])
            console.log(window.selected.obs['class_pred']);
            if (r & (window.selected.obs['class'] === window.selected.obs['class_pred'])) {
                accuracyBatch.push(1);
            } else if (!r & (window.selected.obs['class'] != window.selected.obs['class_pred'])) {
                accuracyBatch.push(1);
            } else {
                accuracyBatch.push(0);
            }

            if(currentCar >= 5){
                decisionBatch.push(r);
            }

            // update a car
            if(currentCar < 5) {
                window.selected.obs = window.data.carTut[currentCar];
            }
            else if (currentCar >= 5 && currentCar < 45){
                window.selected.obs = window.data.carOpt[currentCar - 5];
            }
            else if (currentCar >= 45) {
                window.selected.obs = window.data.carEval[currentCar - 45];
            }


            //console.log(window.selected.obs);
            window.selected.idx = parseInt(window.selected.obs[""]);
            window.selected.class = window.selected.obs.class_pred;
            fillComponents();
            // show tutorials
            if (currentCar >= 4 && currentCar < 44) {
                // tutorials
                if(!tutorialsShown['opt']) {
                    opt.start();
                    tutorialsShown["opt"] = true;
                }
            }
            else if (currentCar >= 44) {
                // opt
                if(!tutorialsShown['eval']) {
                    evaluation.start();
                    tutorialsShown["eval"] = true;
                }
            }
            // update left panels
            updateLeftPanel(window.selected.obs, d3.mean(accuracyBatch).toFixed(3), currentCar, maxCars);
            
            // update visualizations only every X number of questions. 
            if(currentCar% REWARD_INTERVAL === 0 & currentCar > 5 & currentCar <= 45){

                d3.select('#dynamicIA').html("<div id='loader'><p>Loading...</p></div>");
                console.log("updating IA.");
                $(".decisionBtt").off('click');
                meanReward = d3.mean(decisionBatch)
                console.log(meanReward)
                meanReward = meanReward * Math.exp(-time/50000);

                console.log(time);

                IAHistory.scores.push(meanReward);
                decisionBatch = [];
                
                $.ajax({
                    url : "./optimizer.php",
                    type : "POST",
                    data: {
                        data: JSON.stringify(
                            IAHistory
                            )
                        },
                    success: function(result) {
                        var l = (JSON.parse(result)["architectures"]).length
                        var structure = JSON.parse(result)["architectures"][l - 1];
                        IAHistory.architectures.push(structure);
                        $(".decisionBtt").click(
                            clickDecisionBtt
                        );
                        
                        //make grid, filling the components
                        makeGrid(structure["components"], "dynamicIA");
                        fillComponents();
                        
                    }
                });

                // send to PHP
                $.ajax({
                    url : "./data.php",
                    type : "POST",
                    data: {
                        data: JSON.stringify(
                            {
                                participant_id: participantID,
                                question_id: currentCar,
                                reward: meanReward,
                                choice: r,
                                arrangement: JSON.stringify(IAHistory),
                                variant: variant
                            })
                        },
                    success: function(result) {
                        console.log(result);
                    }
                });
            }

        }

        // initially on view experiments, initialize left panel and visualizations
        onViewPage(
            function() {
                $("#progressBar").hide();
                // start tutorial
                intro.start();
                window.selected.obs = window.data.carTut[0];
                window.selected.class = window.selected.obs.class_pred;
                window.selected.idx = parseInt(window.selected.obs[""]);
                d3.select('#dynamicIA').html("<div id='loader'><p>Loading...</p></div>");
                // generate first architecture
                updateLeftPanel(window.selected.obs, 0,0, maxCars);
                $.ajax({
                    url : "./optimizer.php",
                    type : "POST",
                    data: { 
                        variant: JSON.stringify(variant)
                        },
                    success: function(result) {
                        console.log("onview receives IA history. ")
                        IAHistory = JSON.parse(result);
                        console.log("The IA history is ");
                        console.log(IAHistory);
                        console.log("new IA");
                        console.log(result);
                        var l = (JSON.parse(result)["architectures"]).length
                        var structure = JSON.parse(result)["architectures"][l - 1];
                        IAHistory.architectures.push(structure);
                        makeGrid(structure["components"], "dynamicIA");
                        fillComponents();

                    }
                });

            }, "#experiment2_page");

    };

        onViewPage(
            function() {
                $("#progressBar").show();
            }, "#comments_page"
        );
    return {
        initializeUI: function() {initializeUI()}
    }
}

$(function() {
    var test = sampleTest();
    test.initializeUI();
});

/**
 * makeGrid -- Render a bootstrap grid to the DOM following the specification in `spec`
 * @param spec -- specification for the grid (nested JSON)
 * @param _parentElem -- The ID of the div to draw the grid in (no '#')
 *
 * example spec:
 *
 *      {"id": -1,   // The ID of the viz component (-1 for inner node)
 *       "height": 1,    // Height as a proportion of parent
 *       "width": 1,     // Width as a proportion of parent
 *       "orientation": "n",  // "n" == none; "v" == vertical; "h" == horizontal
 *       "left_child": { ... },    // Recursively defined
 *       "right_child": { ... }
 *      }
 *
 */
function makeGrid(spec, _parentElem) {
    var container = d3.select('#' + _parentElem)
    .html("");
    var elemBbox = container.node().getBoundingClientRect(),
    w = elemBbox.width,
    h = elemBbox.height;
    drawSingleGridLevel(spec, container, w, h, 0, 0);


}
  
  /**
   * drawSingleGridLevel -- Recursively draw the grid
   * @param data  -- A JS object containing the data to be rendered
   * @param elem  -- An HTML selection (parent element)
   */
function drawSingleGridLevel(data, elem, w, h, left, top) {

    if(Object.keys(data.left_child).length !== 0) {
            // check left child
        // if an inner node, continue
        // if a leaf, then set it's appearance
        if (data.left_child.id === -1) {
            drawSingleGridLevel(data.left_child, elem, data.left_child.width * w, data.left_child.height * h, left, top);
        }
        else {
            elem.append('div')
            .call(setChildAttrs, data.left_child.width * w, data.left_child.height * h, left, top, data.left_child.id);
        }
    }

    if(Object.keys(data.right_child).length !== 0) {
    // check right child
    // if an inner node, continue
    // if a leaf, then append div and set it's appearance
        if(data.right_child.id === -1) {
            if(data.right_child.orientation === 'v') {
                drawSingleGridLevel(data.right_child, elem, data.right_child.width * w, data.right_child.height * h, left + data.left_child.width * w, top);
            }
            else {
                drawSingleGridLevel(data.right_child, elem, data.right_child.width * w, data.right_child.height * h, left, top + data.left_child.height * h);
            }
        }
        else {
            if (data.right_child.orientation === 'v') {
                elem.append('div')
            .call(setChildAttrs, data.right_child.width * w, data.right_child.height * h, left + data.left_child.width * w, top, data.right_child.id);
            }
            else {
                elem.append('div')
            .call(setChildAttrs, data.right_child.width * w, data.right_child.height * h, left, top + data.left_child.height * h, data.right_child.id);
            }
        }
    }

}

function fillComponents() {
    for (let i = 0; i < window.components.length; i++) {
        const vis = window.components[i];
        j = i + 1
        if($("#vis-container-" + j).length !== 0) {
            // fill if exist
            d3.select('#vis-container-' + j)
            .html("");
            vis.draw("vis-container-" + j);

          }
        
    }
}

function setChildAttrs(e, width, height, left, top, id) {
    width = Math.floor(width) + 'px';
    height = Math.floor(height) + 'px';
    left = Math.floor(left) + 'px';
    top = Math.floor(top) + 'px';
    e.style('position', 'absolute')
        .attr('class', 'vis-container')
        .attr('id', `vis-container-${id}`)
        .style('width', width)
        .style('height', height)
        .style('left', left)
        .style('top',  top);


}

