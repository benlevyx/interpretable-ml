<?php
require_once("survey.php");
require_once("config.php");
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <!-- JQuery   -->
    <script src="https://code.jquery.com/jquery-3.3.1.min.js"
            integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
            crossorigin="anonymous"></script>

    <!-- Bootstrap   -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"
            integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49"
            crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
          integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO"
          crossorigin="anonymous">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"
            integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy"
            crossorigin="anonymous"></script>

    <!-- Other libraries   -->
    <script src="../js/utils.js"></script>
    <script src="../js/location.js"></script>

    <!-- other survey-related files -->
    <link rel="stylesheet" href="survey.css">
    <script src="survey.js"></script>
</head>
<body>
<div class="container">
    <h1>Test survey</h1>
    <?php
    $survey = (new Survey("test_survey", 0.1, "test.php"))
        ->addItem(new StaticItem("Welcome to test survey", "Be ready to answer a few questions"))
        ->addItem(new ScaleItem("How well is the survey system working?", "Be candid", "custom", "satisfaction", "satisfaction1", "Very poorly", "Very well", ["allowNA" => false, "allowDontUnderstand" => false, "allowDecline" => true]))
        ->addItem(new ScaleItem("I am dissatisfied with how the survey system working", "", "custom", "satisfaction", "satisfaction2", "Strongly disagree", "Strongly agree", ["reverseCoded" => true]))
        ->addItem(new ChooseOneItem("Choose one", "if you dare...", "custom", "", "choose_one_test",
            [["option_key" => "o1", "option_label" => "First option"], ["option_key" => "o2", "option_label" => "Second option"], ["option_key" => "o3", "option_label" => "Third option"]],
            ["allowNA" => true, "allowDontUnderstand" => true, "allowDecline" => true]))
        ->addItem(new ChooseMultipleItem("Choose multiple", "", "custom", "", "choose_multiple_test",
            [["option_key" => "o1", "option_label" => "First option"],
                ["option_key" => "o2", "option_label" => "Second option"],
                ["option_key" => "o3", "option_label" => "Third option"],
                ["option_key" => "other", "option_label" => "Other: ", "allow_free_response" => true]],
            ["allowNA" => true, "allowDontUnderstand" => false, "allowDecline" => true]))
        ->addItem(new ChooseCountryItem("Choose country", "", "", "", "country"))
        ->addItem(new NumberItem("How old are you?", "", "", "", "age"))
        ->addItem(new LongTextItem("Write an essay", "", "", "", "long_text_test"))
        ->addItem((new ScaleItemGroup("Test scale item group", "",
            "custom_instrument", "test_scale_construct", "test_group",
            "Strongly disagree", "Strongly agree", ["scaleSize" => 7]))
            ->addScaleItem("first item", null, null, "first_group_item")
            ->addScaleItem("second item", null, null, "second_group_item")
        )
    ;




    $survey->render();
    ?>

    <script>
        $(function() {
            var testSurvey = litwSurvey("test_survey");
            testSurvey.onChange(function(s) {
                if (s.value("choose_one_test") == "o1")
                    s.show("age");
                else
                    s.hide("age");
            });
            testSurvey.onSurveyCompletion(function() {console.log("Survey completed!")})

        });
    </script>


    <h1>Results</h1>
    <?php
//        $satisfaction1Results = new ItemResults($survey->getItem("satisfaction1"), $mysqli, "survey_results");
////        echo("Number responded: " . $satisfaction1Results->getNResponded() . "\n");
////        echo("Number presented: " . $satisfaction1Results->getNPresented() . "\n");
////        var_dump($satisfaction1Results->getCounts());
//        echo("Number responded: " . $satisfaction1Results->getNResponded() . "\n");
//        echo("Number presented: " . $satisfaction1Results->getNPresented() . "\n");
//        $satisfaction1Results->renderVerticalHistogram(true, true);
//    $satisfaction1Results->renderHorizontalHistogram(true, true, true);
//
//    $chooseOneResults = new ItemResults($survey->getItem("choose_one_test"), $mysqli, "survey_results");
////    var_dump($chooseOneResults->getCounts($chooseOneResults->surveyItem->optionsToChooseFrom));
//    $chooseOneResults->renderVerticalHistogram(true, true, $chooseOneResults->surveyItem->optionsToChooseFrom);

    $survey->renderResults($mysqli, "survey_results", true, true);


    ?>

</div>

</body>
</html>