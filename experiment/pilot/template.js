/**
 * LabintheWild study template
 *
 * authors: Krzysztof Gajos
 */

// global debug variable
var debug = 1;

var condition = 0

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

  for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
  }
};

condition = (getUrlParameter('ver') ? parseInt(getUrlParameter('ver')): Math.floor(Math.random() * Math.floor(2)));

var dataReceiver = './data.php'

console.log(condition);
// global progress bar variable (could be made private)
var progressBar = null;

var currentQuestion = 0;
var currentTime = 0;
const MAX_QUESTIONS = 6;

const VIEW_TIME = 6000;

$('#viewTime').text(VIEW_TIME/ 1000);
var dataBen,
dataIke,
dataWp,
dataZilin,
dataImbalance;

var visSequence = [LearningCurveVis, HistogramVis, ConfusionMatrixVis, ScatterVis];
var visName = ['Learning Curve', 'Data Distribution', 'Confusion Matrix', 'PCA'];



var allData;

// Loading data
Promise.all([
  d3.json('data/data_ben.json'),
  d3.json('data/data_ike.json'),
  d3.json('data/data_wp.json'),
  d3.json('data/data_zilin.json'),
  d3.json('data/data_imbalance.json'),
  d3.json('data/data_overfitting.json'),
  d3.json('data/data_underfitting.json'),
]).then(data => {
    [
      dataBen,
      dataIke,
      dataWp,
      dataZilin,      
      dataImbalance,
      dataOverfitting,
      dataUnderfitting
    ] = data.map(parseData);

    allData = [dataBen,
      dataIke,
      dataWp,
      dataZilin,      
      dataImbalance,
      dataOverfitting,
      dataUnderfitting];

    // new LearningCurveVis("vis", dataBen.learningCurve, {});
    // new HistogramVis("vis", dataBen.data, {});
    // new ConfusionMatrixVis("vis", dataBen.data.test);
    // new ScatterVis("vis", dataBen.data.train, {})
    // new FeatureImportanceVis("vis", dataBen.featureImportance, {})
})

function updateVis(visDiv, visName, data, config = {}) {
    $(visDiv).empty();
    new visName(visDiv, data, config);
}

function sampleTest() {
    var intro = introJs();
    if (condition == 0) {
      intro.setOptions({
        steps: [
          {
              element: "#listOfVis",
              intro: "In here you will be able to see different visualizations about the model and the dataset. You are able to view the visualizations for however many times you want, but you have to view them for a certain amount of time before proceeding. "
          },  
          {
              element: "#modelError",
              intro: "After viewing the visualizations, you can select what the model errors are. Indicate your choices in the drop down menu. "
            },       
  
          {
              element: "#confidence",
              intro: "We are also interested in how confidently you make the decisons"
          },    
  
          {
            element: "#preference",
            intro: "Which visualization do you think is the most useful?"
          },    
  
          {
              intro: "Submit all your choices when ready. The quiz starts after you click on 'Done'. "
          },
  
        ],
        showStepNumbers:false
      });
    } else {


      intro.setOptions({
        steps: [
          {
              element: "#carouselExampleIndicators",
              intro: "In here you will be able to see different visualizations about the model and the dataset. You will view them in a sequence, and then you can check all of them at the end. "
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
            element: "#preference",
            intro: "Which visualization do you think is the most useful?"
          },    
  
          {
              intro: "Submit all your choices when ready. The quiz starts after you click on 'Done'. "
          },
  
        ],
        showStepNumbers:false
      });
  
    }

    intro.onexit(function() {
      console.log('complete');
      console.log('test start');
      currentTime = new Date();
      $('input[name=time]').val(currentTime);
      setTimeout(function(){
        $('.carousel-control-next').show();
      }, VIEW_TIME);
    })

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
        
        $("#experiment_button").hide();
        $("#experiment_button").click(function () {
            isSubmit = false;
            console.log("next")
            var timeInterval = new Date() - currentTime;
            currentTime = new Date();

            $('input[name=sequence]').val($('input[name=sequence]').val() + timeInterval);

            $('input[name=time]').val(111000);
            console.log(timeInterval);

            currentQuestion += 1;

            $(".carousel-vis").empty();
            updateSlidesVis();

            $('#numQ').text(currentQuestion);
            $("#d3Vis").empty();

            //$(".vis").click(visClick);

            //$(".vis").addClass("w3-black");
            if (currentQuestion > MAX_QUESTIONS) {
                viewPage("#comments_page");
            }
            $(".vis").show();
            $("#experiment_button").hide();
            
            $('.carousel-control-next').hide();
            setTimeout(function(){
              $('.carousel-control-next').show();
            }, VIEW_TIME);

            if(condition == 1 ) {
              $(".carousel").carousel(0)
        
              $('.carousel').show();
              $('.carousel').carousel('pause');
              $('#listOfVis').hide()
            }
        });

        $("#comments_button").click(function () {
            viewPage("#results_page");
            // we do not really need the progress bar on the results page so we make it disappear
            $("#progressBar").slideUp(2000);
        });


        $(".vis").click(visClick);

        // condition initialization
        if(condition == 0) {
          $('.carousel').hide();
        } else if(condition == 1) {
          $('.carousel').show();
          $('#listOfVis').hide();
        }
        // carousel initialization

        $('.carousel-control-next').click(function(){
          console.log('hide Buttons')
          $( "#carouselExampleIndicators" ).focus();

          $('.carousel-control-next').hide()
          setTimeout(function(){
            $('.carousel-control-next').show();
          }, VIEW_TIME);

          let currentIndex = $('div.active').index() + 1;
          if(currentIndex == 4){
              $('.carousel').hide()
              $('#listOfVis').show();
          }
          }
        )
    };

    onViewPage(function() {
        updateSlidesVis();

        $('.carousel-control-next').hide();
        $('.carousel').carousel('pause');
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

function updateSlidesVis() {
  visSequence.forEach(function (v, i, arr) {
    /**
     *
     *   if($(this).attr('id') == "bt1" ) { // LC
            updateVis('d3Vis',LearningCurveVis, data.learningCurve);
          } else if ($(this).attr('id') == "bt2") {
            updateVis('d3Vis',ScatterVis, data.data.train);
          }
          else if ($(this).attr('id') == "bt3") {
            updateVis('d3Vis',ConfusionMatrixVis, data.data.test);
          }
          else if ($(this).attr('id') == "bt4") {
            updateVis('d3Vis',FeatureImportanceVis, data.featureImportance);
          }
          else if ($(this).attr('id') == "bt5") {
            updateVis('d3Vis',HistogramVis, data.data);
          }

          var visSequence = [LearningCurveVis, HistogramVis, ConfusionMatrixVis, ScatterVis]

     */
    let data = allData[currentQuestion];
    let config;
    if (i == 0) {
      data = data.learningCurve;
    } else if (i == 1) {
      data = data.data;
      config = {width: 1200};
    } else if (i == 2) {
      data = data.data.test;
    } else if (i == 3) {
      data = data.data.train;
    }

    updateVis("slide-" + i, v, data, config);
  });
}

function visClick() {
  // change the vis here


  // new LearningCurveVis("vis", dataBen.learningCurve, {});
  // new HistogramVis("vis", dataBen.data, {});
  // new ConfusionMatrixVis("vis", dataBen.data.test);
  // new ScatterVis("vis", dataBen.data.train, {})
  // new FeatureImportanceVis("vis", dataBen.featureImportance, {})

  let data = allData[currentQuestion];

  $("#d3Vis").empty();
  if($(this).attr('id') == "bt1" ) { // LC
    updateVis('d3Vis',LearningCurveVis, data.learningCurve);
  } else if ($(this).attr('id') == "bt2") {
    updateVis('d3Vis',ScatterVis, data.data.train);
  }
  else if ($(this).attr('id') == "bt3") {
    updateVis('d3Vis',ConfusionMatrixVis, data.data.test);
  }
  else if ($(this).attr('id') == "bt4") {
    updateVis('d3Vis',FeatureImportanceVis, data.featureImportance);
  }      
  else if ($(this).attr('id') == "bt5") {
    updateVis('d3Vis',HistogramVis, data.data);
  }
  //document.getElementById('id01').style.display='block';
  //$(this).off("click");
  //$(this).removeClass("w3-black");

  $(".vis").hide();
  $("#experiment_button").hide();
  setTimeout(function() {
    if(isSubmit){
      $("#experiment_button").show();
    }
    $(".vis").show();
  }, VIEW_TIME);


  $('input[name=sequence]').val($('input[name=sequence]').val() + $(this).attr('id') + ',');

  var timeInterval = new Date() - currentTime;
  currentTime = new Date();

  $('input[name=sequence]').val($('input[name=sequence]').val() + timeInterval + ',');
}