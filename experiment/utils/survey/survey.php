<?php
require_once(__DIR__ . "/../php/utils.php");

// by default, survey results will be saved to database table with this name:
$defaultSurveyDbTableName = "survey_results";
// but you can override it by adding mappings to the dictionary below in the form:
// surveyCode => databaseTableName
$surveyCodesToDbTableNames = [];

// if there is a CGI request with survey results, save those results
//if (isset($_REQUEST['items']))
//    saveSurveyResults();
//else
//    testSurvey();


/********************************
 * Processing survey values
 ********************************/


function saveSurveyResults() {
    global $mysqli;
    global $surveyCodesToDbTableNames;
    global $defaultSurveyDbTableName;

    $participantId = getRequestValue("participant_id", -1);
    if (!is_numeric($participantId))
        $participantId = -1;
    $sessionId = getRequestValue("session_id", -1);
    if (!is_numeric($sessionId))
        $sessionId = -1;
    $surveyCode = getRequestValue("survey_code", "");
    $surveyVersion = getRequestValue("survey_version", 0);
    $items = getRequestValue("items", "{}");
    $items = json_decode($items, true);

    // check if the results of this survey should be saved to a custom table
    $dbTable = $defaultSurveyDbTableName;
    if (array_key_exists($surveyCode, $surveyCodesToDbTableNames))
        $dbTable = $surveyCodesToDbTableNames[$surveyCode];
    // make sure that the database table exists; create it otherwise
    ensureSurveyTable($dbTable);

    $itemColumns = array("instrument_code", "construct_code", "item_code", "option_code", "value_int", "value_float", "value_text", "na", "dont_understand", "decline_to_answer");
    foreach ($items as $item) {
        $tempColumns = array("participant_id", "session_id", "survey_code", "survey_version");
        $values = array($participantId, $sessionId, $surveyCode, $surveyVersion);

        for($i=0; $i<sizeof($itemColumns); $i++) {
            if (isset($item[$itemColumns[$i]])) {
                $tempColumns[] = $itemColumns[$i];
                $values[] = $item[$itemColumns[$i]];
            }
        }
        $res = insert($dbTable, $tempColumns, $values);
        if (!$res)
            echo mysqli_error($mysqli) . "\n\n";
    }
    echo("OK");
}

function ensureSurveyTable($tableName) {
    ensureTable($tableName, "CREATE TABLE `" . $tableName . "` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `participant_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `survey_code` varchar(100) DEFAULT NULL COMMENT 'our own designation for a particular survey',
  `survey_version` float DEFAULT NULL,
  `instrument_code` varchar(100) DEFAULT NULL COMMENT 'name of established instrument (if any) from which we are taking this item',
  `construct_code` varchar(100) DEFAULT NULL COMMENT 'name of the construct that this item belongs to',
  `item_code` varchar(100) DEFAULT NULL COMMENT 'name or number of this particular item',
  `option_code` varchar(100) DEFAULT NULL COMMENT 'used for items where multiple values can be slected',
  `value_int` int(11) DEFAULT NULL,
  `value_float` float DEFAULT NULL,
  `value_text` text,
  `na` tinyint(1) DEFAULT NULL COMMENT 'set to true if participant responded with \"not appliacable\"',
  `dont_understand` tinyint(1) DEFAULT NULL COMMENT 'set to true if participant responded with \"I don''t understand the question\"',
  `decline_to_answer` tinyint(1) DEFAULT NULL COMMENT 'set to true if participant declined to answer',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `participant_id` (`participant_id`),
  KEY `session_id` (`session_id`),
  KEY `survey_code` (`survey_code`),
  KEY `instrument_code` (`instrument_code`),
  KEY `construct_code` (`construct_code`),
  KEY `item_code` (`item_code`),
  KEY `option_code` (`option_code`),
  KEY `na` (`na`),
  KEY `dont_understand` (`dont_understand`),
  KEY `decline_to_answer` (`decline_to_answer`),
  KEY `survey_version` (`survey_version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
}


/********************************
 * Survey creation and rendering
 ********************************/

/**
 * An example of how to generate a one-page survey.
 */
function testSurvey() {
    $survey = (new Survey("test_survey", 0.1))
        ->addItem(new StaticItem("Welcome to test survey", "Be ready to answer a few questions"))
        ->addItem(new ScaleItem("How well is the survey system working?", "Be candid", "custom", "satisfaction", "satisfaction1", "Very poorly", "Very well", ["allowNA" => false, "allowDontUnderstand" => false, "allowDecline" => true]))
        ->addItem(new ScaleItem("I am dissatisfied with how the survey system working", "", "", "satisfaction", "satisfaction2", "Strongly disagree", "Strongly agree", ["reverseCoded" => true]));

    // if the survey is embedded in an existing page, don't run the header and footer functions
    surveyPageHeader();
    $survey->render();
    surveyPageFooter();
}


/**
 * Class Survey
 *
 * Defines a one-page survey. For now, if you need a survey that spans several pages, create a separate Survey object
 * for each page
 */
class Survey{

    public $surveyCode;
    public $surveyVersion; // we are recording these as floats
    public $submitButtonText = "Next";
    protected $items;
    protected $formId;

    public function __construct($surveyCode, $surveyVersion) {
        $this->surveyCode = $surveyCode;
        $this->surveyVersion = $surveyVersion;
    }

    public function addItem($surveyItem) {
        $this->items[] = $surveyItem;
        return $this;
    }

    public function render() {
        $this->formId = "form_" . $this->surveyCode;
        $submitButtonId = "button_" . $this->surveyCode;
        // render the header for the entire survey
        echo <<<S
    <form name="$this->surveyCode" id="$this->formId">
    <input type="hidden" name="survey_code" value="$this->surveyCode"/>
    <input type="hidden" name="survey_version" value="$this->surveyVersion"/>
    <input type="hidden" name="participant_id"/>
    <input type="hidden" name="session_id"/>    
S;
        // render individual survey items
        foreach ($this->items as $item) {
            $item->render();
        }
        // render the footer of the survey
        echo <<<S
    </form>
    <div class="text-right">
        <button id="$submitButtonId" class="survey-btn btn btn-primary btn-lg" 
        onclick="processSurveyResults('$this->formId')">
            $this->submitButtonText
        </button>
    </div>
S;
        return $this;
    }
}



abstract class SurveyItem {
    public $itemType;
    public $prompt;
    public $subprompt;

    public $instrumentCode;
    public $constructCode;
    public $itemCode;

    public $required = false;
    public $allowNA = false;
    public $allowDecline = false;
    public $allowDontUnderstand = false;

    protected static $itemIdCount = 1;
    protected $itemId;

    public function __construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $properties=[]) {
        $this->prompt = $prompt;
        $this->subprompt = $subprompt;
        $this->instrumentCode = $instrumentCode;
        $this->constructCode = $constructCode;
        $this->itemCode = $itemCode;
        $this->itemId = "surveyItem_" . SurveyItem::$itemIdCount++;
        $this->setProperties($properties);
    }

    public function setProperty($name, $value) {
        $this->$name = $value;
        return $this;
    }

    public function setProperties($dict) {
        foreach ($dict as $name => $value)
            $this->$name = $value;
        return $this;
    }

    public function render() {
        $this->renderHeader();
        echo <<<ROW
        <div class="form-row">
        <div class="col-sm-9 col-md-8">
ROW;

        $this->renderBody();
        echo "</div>\n<div class='col-sm-3 col-md-4'>";
        $this->renderExtras();
        echo "</div>\n</div>\n";
        $this->renderFooter();
        return $this;
    }

    protected function renderHeader() {
        $decoration = "";
        if ($this->required)
            $decoration = '<span class="required"> * </span>';
        echo <<<Q
    <div class="surveyItem surveyItem-{$this->itemType}" id="$this->itemId" data-instrument_code="$this->instrumentCode" data-construct_code="$this->constructCode" data-item_code="$this->itemCode">
    <p class="itemPrompt">$this->prompt $decoration</p>
    <p class="itemSubprompt">$this->subprompt</p>
Q;
    }

    protected function renderBody() {}

    protected function renderExtras() {
        if ($this->allowNA) {
            echo <<<NA
    <label>
        <input type="checkbox" class="surveyItem-extra na">
        Not applicable
    </label><br/>
NA;
        }
        if ($this->allowDontUnderstand) {
            echo <<<DU
    <label>
        <input type="checkbox" class="surveyItem-extra dont_understand">
        I don't understand the question
    </label><br/>
DU;
        }
        if ($this->allowDecline) {
            echo <<<DEC
    <label>
        <input type="checkbox" class="surveyItem-extra decline_to_answer">
        I prefer not to answer
    </label><br/>
DEC;
        }
    }

    protected function renderFooter() {
        echo "</div>\n";
    }
}

class StaticItem extends surveyItem {

    public function __construct($prompt, $subprompt = "") {
        parent::__construct($prompt, $subprompt, "", "", "");
        $this->itemType = "static";
    }
}

class ScaleItem extends SurveyItem {
    public $leftAnchor;
    public $rightAnchor;
    public $scaleSize = 5;
    public $reverseCoded;

    public function __construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $leftAnchor, $rightAnchor, $properties = []) {
        parent::__construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $properties);
        $this->itemType = "scale";
        $this->leftAnchor = $leftAnchor;
        $this->rightAnchor = $rightAnchor;
    }

    protected function renderBody() {
        $values = $this->reverseCoded ? range($this->scaleSize, 1, -1) : range(1, $this->scaleSize);
        echo <<<LQ
    <div class="row">
        <div class="col-sm-3 col-md-4 text-right">
            <label for="{$this->itemId}_1">$this->leftAnchor</label>
        </div>
        <div class="col-sm-auto">
        <input class="response" type="radio" name="$this->itemCode" id="{$this->itemId}_1" value="$values[0]">
LQ;
        for ($i=2; $i<$this->scaleSize; $i++) {
            echo('<input class="response" type="radio" name="' . $this->itemCode . '" id="' . $this->itemId . "_" . $i . '" value="' . $values[$i-1] . '">');
        }
        echo <<< LQ
            <input class="response" type="radio" name="$this->itemCode" id="{$this->itemId}_{$this->scaleSize}" value="{$values[$this->scaleSize-1]}">
        </div>
        <div class="col-sm-3 col-md-4 text-left">
            <label for="{$this->itemId}_{$this->scaleSize}">$this->rightAnchor</label>
        </div>
    </div>
LQ;
    }

}

function surveyPageHeader() {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
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

        <!-- other survey-related files -->
        <link rel="stylesheet" href="survey.css">
        <script src="survey.js"></script>
    </head>
    <body>
    <?php
}

function surveyPageFooter() {
    ?>
    </body>
    </html>
    <?php
}