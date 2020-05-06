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

var IAHistory = {
};


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
                intro: "Have fun :)"
              },
    
          ],
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

                IAHistory.scores.push(r);
                if(currentCar <= maxCars){
                    currentCar += 1;
                    displayVis();
                    //console.log(IAHistory);
                    // send to python
                    $.ajax({
                        url : "./optimizer.php",
                        type : "POST",
                        data: {
                            data: JSON.stringify(
                                IAHistory
                                )
                            },
                        success: function(result) {
                            var structure = JSON.parse(result)["architectures"][0];
                            IAHistory.architectures.push(structure);
                            //console.log(IAHistory);
                            structure = structure['components'];

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
                                    arrangement: JSON.stringify(IAHistory),
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
                $("#progressBar").hide();
                // start tutorial
                intro.start();
                d3.select('#dynamicIA').html("<p>loading</p>");
                // generate first architecture
                $.ajax({
                    url : "./optimizer.php",
                    type : "POST",
                    data: {
                        },
                    success: function(result) {
                        var structure = JSON.parse(result)["architectures"][0]["components"];
                        //console.log(result);
                        makeGrid(structure, "dynamicIA");
                        IAHistory.architectures.push(JSON.parse(result)["architectures"][0]);
                    }
                });

            }, "#experiment2_page");

    };

        onViewPage(
            function() {
                $("#progressBar").show();
            }, "#comments_page"
        );

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
function setChildAttrs(e, width, height, left, top, id) {
    width = Math.floor(width) + 'px';
    height = Math.floor(height) + 'px';
    left = Math.floor(left) + 'px';
    top = Math.floor(top) + 'px';
    e.style('position', 'absolute')
        .attr('class', `vis-container vis-container-${id}`)
        .style('width', width)
        .style('height', height)
        .style('left', left)
        .style('top',  top)
        .style('border', "1px solid #FFF");


}

