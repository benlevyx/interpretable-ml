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
var maxCars = 20;
var arrangements = {};
var taskTime = {};
var variant = ((Math.random() > 0.5) ? 1 : 0); // randomize experiment variable

function sampleTest() {
    var startTime;
    var initializeUI = function() {
        
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

            function() {
                var time = new Date() - startTime;
                startTime = new Date()
                var r = 0;
                //console.log($(this).attr('id') === "agreeBtt");
                if($(this).attr('id') === "agreeBtt"){
                    r = 1;
                }
                if(currentCar <= maxCars){
                    currentCar += 1;
                    displayVis();
                    console.log(currentCar);
                    // send to python
                    $.ajax({
                        url : "./optimizer.php",
                        type : "POST",
                        data: {
                            data: JSON.stringify(
                                {
                                    cur: currentCar,
                                    r: r
                                })
                            },
                        success: function(result) {
                            var structure = JSON.parse(result)["architectures"][0]["components"];
                            console.log(result);
                            makeGrid(structure, "dynamicIA");
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
                                    time_spent: time,
                                    choice: r,
                                    arrangement: "123",
                                    variant: variant
                                })
                            },
                        success: function(result) {
                            console.log(result);
                        }
                    });
                    
                } else{
                    viewPage("#comments_page");
                };
            }
        );
        onViewPage(
            function() {
                displayVis($("#visualization_form").val());
            }, "#experiment2_page");

    };

    var displayVis = function(){
        $("#viz").text(currentCar);


    };
    return {
        initializeUI: function() {initializeUI()}
    }
}

$(function() {
    var test = sampleTest();
    test.initializeUI();
});

function displayVis(form) {
    // display viz according to form
    console.log(form);
    $("#viz").text(form);
}



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
        .html("")
        .append('div')
        .attr('class', 'container db-container');

    drawSingleGridLevel(container, spec, false);
  }
  
  /**
   * drawSingleGridLevel -- Recursively draw the grid
   * @param elem  -- A d3 selector to a div element
   * @param data  -- A JS object containing the data to be rendered
   * @param isRow -- true if the element is a row
   *                 (can't draw another row inside, can't end the
   *                 hierarchy here)
   */
function drawSingleGridLevel(elem, data, isRow) {
    if (data.id !== -1) {
        // Leaf node
        elem.append('div').attr('class', `vis-container vis-container-${data.id}`)
    }
    else {
        var orient = data.orientation,
            left,
            right;

        if (orient === 'v') {
            // Two new rows; stack the children on top of one another

            if (isRow) {
                // First, add a new col
                elem = elem.append('div')
                    .attr('class', 'col')
                    .attr('width', '100%');
            }
            left = elem.append('div')
                .attr('class', 'row')
                .attr('width', convertToPercentage(data.left_child.width))
                .attr('height', convertToPercentage(data.left_child.height));

            drawSingleGridLevel(left, data.right_child, true);
            // Object.keys(myObject).length == 0
            if (Object.keys(data.right_child).length !== 0) {
                right = elem.append('div')
                    .attr('class', 'row')
                    .attr('width', convertToPercentage(data.right_child.width))
                    .attr('height', convertToPercentage(data.right_child.height));

                drawSingleGridLevel(right, data.right_child, true);
            }
        } else {
        // Two new cols, in the same row
            console.log(JSON.stringify(data));
            left = elem.append('div')
                .attr('class', 'col')
                .attr('width', convertToPercentage(data.left_child.width));

            drawSingleGridLevel(left, elem.left_child, false);
            if (Object.keys(data.right_child).length !== 0) {
                right = elem.append('div')
                    .attr('class', 'col')
                    .attr('width', convertToPercentage(data.right_child.width));

                drawSingleGridLevel(right, elem.right_child, false);
            }
        }
    }
}

function convertToPercentage(n) {
    return `${Math.round(n * 1000000) / 10000}%`
}