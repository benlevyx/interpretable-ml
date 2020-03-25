/**
 * LabintheWild study template
 *
 * authors: Krzysztof Gajos
 */

// global debug variable
var debug = 1;

// global progress bar variable (could be made private)
var progressBar = null;

function sampleTest() {

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
            viewPage("#experiment_page");
            // visually show that progress has been made through "The test" step on the progress bar
            progressBar.incrementStepProgress();
        });
        $("#experiment_button").click(function () {
            viewPage("#experiment2_page");
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

        onViewPage( 
            function() {
                displayVis($("#visualization_form").val());
            }, "#experiment2_page");

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