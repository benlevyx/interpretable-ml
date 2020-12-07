/**
 * LabintheWild study template
 *
 * authors: Krzysztof Gajos
 */

// global debug variable
var debug = 1;

// global progress bar variable (could be made private)
var progressBar = null;

var currentQuestion = 0;
var currentTime = 0;

var ikeDataTrain,
ikeDataTest,
zilinDataTrain,
zilinDataTest,
zilinPredsTrain,
zilinPredsTest,
featImportanceData,
learningCurveData;

// Loading data
Promise.all([
    d3.csv('data/data_ike_train.csv'),
    d3.csv('data/data_ike_test.csv'),
    d3.csv('data/data_zilin_train.csv'),
    d3.csv('data/data_zilin_test.csv'),
    d3.csv('data/preds_zilin_train.csv'),
    d3.csv('data/preds_zilin_test.csv'),
    d3.csv('data/featureImportance.csv'),
    d3.json('data/learningCurve.json')
]).then(data => {
    [
      ikeDataTrain,
      ikeDataTest,
      zilinDataTrain,
      zilinDataTest,
      zilinPredsTrain,
      zilinPredsTest,
      featImportanceData,
      learningCurveData
    ] = data;

    zilinDataTrain.forEach((d, i) => {
      for (key in d) {
        d[key] = +d[key];
      }
      d.pred = +zilinPredsTrain[i].pred;
    })
    zilinDataTest.forEach((d, i) => {
      for (key in d) {
        d[key] = +d[key];
      }
      d.pred = +zilinPredsTest[i].pred;
    })

    ikeDataTrain.forEach(d => {
      for (key in d) {
        d[key] = +d[key];
      }
    })
    ikeDataTest.forEach(d => {
      for (key in d) {
        d[key] = +d[key];
      }
    })

})

function updateVis(visName, data) {
    $("#d3Vis").empty();
    new visName("d3Vis", data, {});
}

function sampleTest() {
    var intro = introJs();
    intro.setOptions({
      steps: [
        {
            element: "#listOfVis",
            intro: "In here you will be able to see different visualizations about the model and the dataset. You can only view each visualization once. "
        },  
        {
            element: "#modelError",
            intro: "After viewing the visualizations, you can select what the model errors are. Indicate your choices in the drop down menu. "
          },       

        {
            element: "#confidence",
            intro: "We are also interested in how confident you make the decisons"
        },    

        {
            element: "#submitButton",
            intro: "Submit your choices when ready."
        },

      ],
      showStepNumbers:false
    });

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
        litwSurvey("nfc_survey").onSurveyCompletion(function() {viewPage("#experiment_page2")});
        
        onViewPage(function() {
            currentTime = new Date();
            $('input[name=time]').val(currentTime);

        }, "#experiment_page2");

        $("#experiment_button").click(function () {
            console.log("next")
            var timeInterval = new Date() - currentTime;
            currentTime = new Date();
            $('input[name=time]').val(timeInterval);
            console.log(timeInterval);

            currentQuestion += 1;

            if (currentQuestion >= 5) {
                viewPage("#comments_page");
            }

        });

        $("#comments_button").click(function () {
            viewPage("#results_page");
            // we do not really need the progress bar on the results page so we make it disappear
            $("#progressBar").slideUp(2000);
        });


        $(".vis").click(function () {
            // change the vis here
            if($(this).attr('id') == "bt1" ) { // LC
              updateVis(LearningCurveVis, learningCurveData);
            } else if ($(this).attr('id') == "bt2") {
              updateVis(ScatterVis, ikeDataTrain);
            }
            else if ($(this).attr('id') == "bt3") {
              updateVis(ConfusionMatrixVis, zilinDataTest);
            }
            else if ($(this).attr('id') == "bt4") {
              updateVis(FeatureImportanceVis, featImportanceData);
            }      
            else if ($(this).attr('id') == "bt5") {
              updateVis(HistogramVis, {train: zilinDataTrain, test: zilinDataTest});
            }


            currentQuestion += 1;
            document.getElementById('id01').style.display='block';
            $(this).off("click");
            $(this).removeClass("w3-black");
            $('#test').attr('id');

            $('input[name=sequence]').val($('input[name=sequence]').val() + $(this).attr('id'));
        })

    };

    onViewPage(function() {
        console.log("hi");
        intro.start();
    }, "#experiment_page2")

    return {
        initializeUI: function() {initializeUI()}
    }
}

$(function() {
    var test = sampleTest();
    test.initializeUI();
});