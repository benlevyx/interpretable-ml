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
                            console.log(result);
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