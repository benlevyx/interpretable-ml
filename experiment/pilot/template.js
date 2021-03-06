/**
 * LabintheWild study template
 *
 * authors: Krzysztof Gajos
 */

// global debug variable
var debug = 1;

var condition = 0
var reverse = 0;
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
if (Math.random() > 0.3333) {
  condition = 1;

}
else {
  condition = 0; 
}
if (Math.random() > 0.5) {
  reverse = 1;
}
else {
  reverse = 0;
}

if (condition == 1) {
  $("#seqVisDesc").show();
}


var dataReceiver = './data.php'

console.log({condition, reverse});

// global progress bar variable (could be made private)
var progressBar = null;

var currentQuestion = 0;
var currentTime = 0;

var currentTimeC = 0;


var currentIndex = 0; // current index of the visualization
const MAX_QUESTIONS = 8;

const VIEW_TIME = 6000;

$('#viewTime').text(VIEW_TIME/ 1000);
var dataBen,
dataIke,
dataWp,
dataZilin,
dataImbalance;

var visSequence = [LearningCurveVis, HistogramVis, ConfusionMatrixVis, ScatterVis];
var visName = ['Learning Curve', 'Data Distribution', 'Confusion Matrix', 'Scatter plots'];

function shuffle(array) {
  let index = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== index) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * index);
    index -= 1;

    // And swap it with the current element.
    temporaryValue = array[index];
    array[index] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
var allData;


const easySeq = shuffle([
  {name: "OOD", "seq":[HistogramVis, LearningCurveVis, ConfusionMatrixVis, ScatterVis], "dataIndex": 0},
  // Class imbalance:
  // Easy: Confusion matrix, 2-d vis, feature distributions, training curve
  // Hard: training curve, feature distributions, 2-d vis, confusion
  {name: "class imbalance", "seq":[ConfusionMatrixVis, ScatterVis, HistogramVis, LearningCurveVis], "dataIndex": 1},
  /* 
    Underfitting:
    Easy: 2-d vis, feature distributions, training curve, confusion matrix
    Hard: confusion matrix, training curve, feature distributions, 2-d vis

    */
    {name: "Underfitting", "seq":[ScatterVis, HistogramVis, LearningCurveVis, ConfusionMatrixVis], "dataIndex": 3},
  /* 
    Overfitting:
    Easy: Training curve, 2-d vis, feature distributions, confusion matrix
    Hard: confusion matrix, feature distributions, 2-d vis, training curve
  */
    {name: "Overfitting", "seq":[LearningCurveVis, ScatterVis, HistogramVis, ConfusionMatrixVis], "dataIndex": 5},

]);

const hardSeq = shuffle([
      /* Underfitting vs. OOD:
      Easy: feature distributions, confusion matrix, training curve, 2-d vis
      Hard: 2-d vis, training curve, confusion matrix, feature distributions
    */    
      {name: "Underfitting vs. OOD", "seq":[ScatterVis, LearningCurveVis, ConfusionMatrixVis, HistogramVis], "dataIndex": 2},

          /* 
      OOD vs. Class imbalance:
      Easy: feature distributions, training curve, 2-d vis, confusion matrix
      Hard: confusion matrix, 2-d vis, training curve, feature distributions
    */
      {name: "OOD vs. Class imbalance", "seq":[HistogramVis, LearningCurveVis, ScatterVis, ConfusionMatrixVis ], "dataIndex": 4},

        /* 
      Class imbalance vs. Underfitting:
      Easy: 2-d vis, training curve, feature importances, confusion matrix
      Hard: confusion matrix, feature importances, training curve, 2-d vis
     */
      {name: "Class imbalance vs. Underfitting", "seq":[ScatterVis, LearningCurveVis, HistogramVis, ConfusionMatrixVis], "dataIndex": 6},

      /* 
        OOD vs. Overfitting:
        Easy: Feature distributions, confusion matrix, 2-d vis, training curve, 
        Hard: training curve, 2-d vis, confusion matrix, feature distributions
  
      */
        {name: "OOD vs. Overfitting", "seq":[HistogramVis, ConfusionMatrixVis, ScatterVis, LearningCurveVis], "dataIndex": 7}
]);
var qvs = []

if (reverse == 0) {
  qvs = [
    easySeq[0]['seq'],
    easySeq[1]['seq'],
    hardSeq[0]['seq'],
    easySeq[2]['seq'],
    hardSeq[1]['seq'],
    easySeq[3]['seq'],
    hardSeq[2]['seq'],
    hardSeq[3]['seq']
  
  ]
  
}
else {
  qvs = [
    easySeq[0]['seq'].reverse(),
    easySeq[1]['seq'].reverse(),
    hardSeq[0]['seq'].reverse(),
    easySeq[2]['seq'].reverse(),
    hardSeq[1]['seq'].reverse(),
    easySeq[3]['seq'].reverse(),
    hardSeq[2]['seq'].reverse(),
    hardSeq[3]['seq'].reverse()
  
  ]
}
const QtoVisSequence = qvs.map(randomizeQuestions);

const sequence = [
  easySeq[0]['name'],
  easySeq[1]['name'],
  hardSeq[0]['name'],
  easySeq[2]['name'],
  hardSeq[1]['name'],
  easySeq[3]['name'],
  hardSeq[2]['name'],
  hardSeq[3]['name']
]

const QtoVisSequenceNames = [
  easySeq[0]['seq'].map(function(d) {return d.name}),
  easySeq[1]['seq'].map(function(d) {return d.name}),
  hardSeq[0]['seq'].map(function(d) {return d.name}),
  easySeq[2]['seq'].map(function(d) {return d.name}),
  hardSeq[1]['seq'].map(function(d) {return d.name}),
  easySeq[3]['seq'].map(function(d) {return d.name}),
  hardSeq[2]['seq'].map(function(d) {return d.name}),
  hardSeq[3]['seq'].map(function(d) {return d.name})

]

const qToDataIndex = [
    easySeq[0]['dataIndex'],
    easySeq[1]['dataIndex'],
    hardSeq[0]['dataIndex'],
    easySeq[2]['dataIndex'],
    hardSeq[1]['dataIndex'],
    easySeq[3]['dataIndex'],
    hardSeq[2]['dataIndex'],
    hardSeq[3]['dataIndex']
  ];


function randomizeQuestions(visSequence) {
  // randomize first 2
  if(Math.random() > 0.5) {
    let dum = visSequence[1];
    visSequence[1] = visSequence[0];
    visSequence[0] = dum;
  };

  return visSequence;
}


console.log({sequence, QtoVisSequenceNames})



// Loading data
Promise.all([
  d3.json('data/ood.json'),
  d3.json('data/class_imbalance.json'),
  d3.json('data/underfitting_vs_ood.json'),
  d3.json('data/underfitting.json'),
  d3.json('data/ood_vs_class_imbalance.json'),
  d3.json('data/overfitting.json'),
  d3.json('data/class_imbalance_vs_underfitting.json'),
  d3.json('data/ood_vs_overfitting.json'),
  //d3.json('data/undertraining_vs_overfitting.json'),
  
]).then(data => {
    [
      ood, 
      class_imbalance,
      underfitting_vs_ood, 
      underfitting,
      ood_vs_class_imbalance,
      overfitting,
      class_imbalance_vs_underfitting,
      ood_vs_overfitting,    
    ] = data.map(parseData);

    allData = [      
      ood, 
      class_imbalance,
      underfitting_vs_ood, 
      underfitting,
      ood_vs_class_imbalance,
      overfitting,
      class_imbalance_vs_underfitting,
      ood_vs_overfitting,
    ];
    let allDataCppy = qToDataIndex.map(item => {return allData[item]})
    allData = allDataCppy;
    // new LearningCurveVis("vis", dataBen.learningCurve, {});
    // new HistogramVis("vis", dataBen.data, {});
    // new ConfusionMatrixVis("vis", dataBen.data.test);
    // new ScatterVis("vis", dataBen.data.train, {})
    // new FeatureImportanceVis("vis", dataBen.featureImportance, {})
})



const modelDesc = [
  `The model used in this analysis is a <b>logistic regression</b> model with a <b>high dimensional polynomial decision boundary</b> with polynomial features of degree 5.`,
  `The model used in this analysis is a <b>logistic regression</b> model with a <b>linear decision boundary</b>.`
]
function updateVis(visDiv, visName, data, config = {}) {
    console.log(visName);
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
              element: "#slides",
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
        console.log("show");
        $('#next_vis').show();
      }, VIEW_TIME);
    })

    var initializeUI = function() {
        // TODO configure progress bar
        progressBar = progress(); // creating progressBar object
        // defining the steps in the study and the page IDs that they correspond to
        progressBar.addStep("Consent", "#consent_page", 1, 1) // the first number indicates how much space this step should take visually
            .addStep("About you", "#demographics_page", 1, 1) // the second number indicates how many substeps are in that stage
            .addStep("The test", "#instructions_page1", 4, 20) // see utils/js/progress.js for more documentation
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
            viewPage("#instructions_page1")
        });
        $("#instructions_button1").click(function () {
          viewPage("#instructions_page3");
          // visually show that progress has been made through "The test" step on the progress bar
          progressBar.incrementStepProgress();
      });
      $("#instructions_button2").click(function () {
        viewPage("#instructions_page3");
        // visually show that progress has been made through "The test" step on the progress bar
        progressBar.incrementStepProgress();
        });
        $("#instructions_button3").click(function () {
          viewPage("#instructions_page4");
          // visually show that progress has been made through "The test" step on the progress bar
          progressBar.incrementStepProgress();
      });
        $("#instructions_button4").click(function () {
          viewPage("#instructions_page5");
          // visually show that progress has been made through "The test" step on the progress bar
          progressBar.incrementStepProgress();
          });
        $("#instructions_button5").click(function () {
          viewPage("#instructions_page6");
          // visually show that progress has been made through "The test" step on the progress bar
          progressBar.incrementStepProgress();
        });
        $("#instructions_button6").click(function () {
          viewPage("#instructions_page7");
          // visually show that progress has been made through "The test" step on the progress bar
          progressBar.incrementStepProgress();
        });
        $("#instructions_button7").click(function () {
          viewPage("#experiment_page2");
          // visually show that progress has been made through "The test" step on the progress bar
          progressBar.incrementStepProgress();
        });
        litwSurvey("nfc_survey").onSurveyCompletion(function() {viewPage("#comments_page")});
        
        $("#experiment_button").hide();
        $("#experiment_button").click(function () {
            isSubmit = false;
            console.log("next")
            let timeInterval = new Date() - currentTime;
            currentTime = new Date();
            if (condition === 1 && currentIndex < 4) {
              $('input[name=sequence]').val($('input[name=sequence]').val() + QtoVisSequenceNames[currentQuestion][currentIndex]) + ',';
            }
            $('input[name=sequence]').val($('input[name=sequence]').val() + timeInterval);

            $('input[name=time]').val(0);
            console.log(timeInterval);
            currentQuestion += 1;
            // change model description
            if(sequence[currentQuestion] === "Overfitting" || sequence[currentQuestion] === "OOD vs. Overfitting") {
              $("#modelDesc").html(modelDesc[0])
            } else {
              $("#modelDesc").html(modelDesc[1])
            }

            if (currentQuestion >= MAX_QUESTIONS) {
              viewPage("#experiment_page");
              return;
          }
/*             //$(".carousel-vis").empty();
            // just incase 
            $("#slide-0").empty();
            $("#slide-1").empty();
            $("#slide-2").empty();
            $("#slide-3").empty(); */

            updateSlidesVis();

            $('#numQ').text(currentQuestion + 1);
            $("#d3Vis").empty();

            $(".vis").show();
            $("#experiment_button").hide();
            
            $('#next_vis').hide();
            setTimeout(function(){
              $('#next_vis').show();
            }, VIEW_TIME);

            if(condition == 1 ) {
              $('#slides').show();
              $('#listOfVis').hide()
            }


            currentIndex = 0;
            $('#slide-0').show();
            $('#slide-1').hide();
            $('#slide-2').hide();
            $('#slide-3').hide();

        });

        $("#comments_button").click(function () {
            viewPage("#results_page");
            // we do not really need the progress bar on the results page so we make it disappear
            $("#progressBar").slideUp(2000);
        });


        $(".vis").click(visClick);

        // condition initialization
        if(condition == 0) {
          $('#slides').hide();
          $('#listOfVis').show();
        } else if(condition == 1) {
          $('#slides').show();
          $('#listOfVis').hide();
        }
        // carousel initialization

        $('#next_vis').click(function(){
            console.log('hide Buttons')

            $('#next_vis').hide()
            setTimeout(function(){
              $('#next_vis').show();
            }, VIEW_TIME);
            
            // hide vis that is not showing



            let timeInterval = new Date() - currentTime;
            currentTime = new Date();

            $('input[name=sequence]').val($('input[name=sequence]').val() + QtoVisSequenceNames[currentQuestion][currentIndex]+ ',');
            
            $('input[name=sequence]').val($('input[name=sequence]').val() + timeInterval + ',');
            currentIndex += 1;


            if(currentIndex == 4){
                $('#slides').hide()
                $('#listOfVis').show();
                return;
            }

            let i;
            for (i = 0; i < 4; i++) {

              $("#slide-" + i).hide();
              if (i == currentIndex) {
                console.log("show");
                $("#slide-" + i).show();
              }
            }

          }
        )
    };

    onViewPage(function() {
        updateSlidesVis();
        $('#next_vis').hide();
        $("#slide-0").show();

        $("#slide-1").hide();

        $("#slide-2").hide();

        $("#slide-3").hide();
        if(sequence[currentQuestion] === "Overfitting" || sequence[currentQuestion] === "OOD vs. Overfitting") {
          $("#modelDesc").html(modelDesc[0])
        } else {
          $("#modelDesc").html(modelDesc[1])
        }
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
  



  visSequence = QtoVisSequence[currentQuestion];



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
    console.log(currentQuestion);
    let config;
    if (v.name == "HistogramVis") {
      data = data.data;
    } else if (v.name == "LearningCurveVis") {
      data = data.learningCurve;
    } else if (v.name == "ConfusionMatrixVis") {
      data = data.data;
      config = {width: 1200};
    } else if (v.name == "ScatterVis") {
      data = data.data.train;
    }
    $("#slide-" + i).empty();
    updateVis("slide-" + i, v, data);
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
  let n = ""
  $("#d3Vis").empty();
  if($(this).attr('id') == "bt1" ) { // LC
    updateVis('d3Vis',LearningCurveVis, data.learningCurve);
    n = 'LearningCurveVis';
  } else if ($(this).attr('id') == "bt2") {
    updateVis('d3Vis', ScatterVis, data.data.train);
    n = 'ScatterVis';
  }
  else if ($(this).attr('id') == "bt3") {
    updateVis('d3Vis',ConfusionMatrixVis, data.data);
    n = 'ConfusionMatrixVis';
  }
  else if ($(this).attr('id') == "bt4") {
    updateVis('d3Vis', FeatureImportanceVis, data.featureImportance);
    n = 'FeatureImportanceVis';
  }      
  else if ($(this).attr('id') == "bt5") {
    updateVis('d3Vis', HistogramVis, data.data);
    n = 'HistogramVis';
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


  var timeInterval = new Date() - currentTime;
  currentTime = new Date();

  $('input[name=sequence]').val($('input[name=sequence]').val() + timeInterval + ',');

  $('input[name=sequence]').val($('input[name=sequence]').val() + n + ',');

}