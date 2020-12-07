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

    $itemColumns = array("instrument_code", "construct_code", "item_code", "item_type", "option_code", "value_int", "value_float", "value_text", "na", "dont_understand", "decline_to_answer");
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
    return true;
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
  `item_type` varchar(100) DEFAULT NULL COMMENT 'used for items where multiple values can be slected',
  `value_int` int(11) DEFAULT NULL,
  `value_float` float DEFAULT NULL,
  `value_text` text,
  `show_in_results` tinyint(1) DEFAULT NULL,
  `na` tinyint(1) DEFAULT NULL COMMENT 'set to true if participant responded with \"not appliacable\"',
  `dont_understand` tinyint(1) DEFAULT NULL COMMENT 'set to true if participant responded with \"I don''t understand the question\"',
  `decline_to_answer` tinyint(1) DEFAULT NULL COMMENT 'set to true if participant declined to answer',
  `dont_know` tinyint(1) DEFAULT NULL COMMENT 'set to true if participant said dont know or not sure',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `participant_id` (`participant_id`),
  KEY `session_id` (`session_id`),
  KEY `survey_code` (`survey_code`),
  KEY `instrument_code` (`instrument_code`),
  KEY `construct_code` (`construct_code`),
  KEY `item_code` (`item_code`),
  KEY `na` (`na`),
  KEY `dont_understand` (`dont_understand`),
  KEY `decline_to_answer` (`decline_to_answer`),
  KEY `survey_version` (`survey_version`),
  KEY `item_type` (`item_type`),
  KEY `dont_know` (`dont_know`),
  KEY `show_in_results` (`show_in_results`)
) ENGINE=InnoDB AUTO_INCREMENT=6587 DEFAULT CHARSET=utf8;");
}


/********************************
 * Survey creation and rendering
 ********************************/


/**
 * Class Survey
 *
 * Defines a one-page survey. For now, if you need a survey that spans several pages, create a separate Survey object
 * for each page
 */
class Survey{

    public $surveyCode;
    public $surveyVersion; // we are recording these as floats
    protected $pages = [];
    protected $itemsByCode = [];
    protected $formId;
    protected $url; // where to submit results of the survey

    public function __construct($surveyCode, $surveyVersion, $url="survey.php") {
        $this->surveyCode = $surveyCode;
        $this->surveyVersion = $surveyVersion;
        $this->url = $url;
    }

    public function addItem($surveyItem)
    {
        if ("SurveyItem" == get_class($surveyItem) || is_subclass_of($surveyItem, "SurveyItem")) {
            // if this is an individual item, add it to the most recently added page (or create a new page)
            if (!count($this->pages))
                $this->pages[] = new SurveyPage("", "", "", "", "");
            $this->pages[count($this->pages) - 1]->addItem($surveyItem);
            $this->itemsByCode[$surveyItem->itemCode] = $surveyItem;
        } elseif ("SurveyPage" == get_class($surveyItem) || is_subclass_of($surveyItem, "SurveyPage")) {
            // if it is a page, add it to the list of pages
            $this->pages[] = $surveyItem;
        }
//        echo("Adding ". get_class($surveyItem) . "; num pages: " . count($this->pages) . "<br/>");
        return $this;
    }

    public function getItem($itemCode) {
        return $this->itemsByCode[$itemCode];
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
        foreach ($this->pages as $page) {
            $page->render();
        }
        // render the footer of the survey
        echo <<<S
    </form>
    <script>
        $(function() {
            litwSurvey("$this->surveyCode");
        });
    </script>
S;
        return $this;
    }

    public function renderResults($mysqli, $tableName, $showCounts, $showPercentages) {
        foreach ($this->pages as $page) {
            if ($page->includeInResults)
                $page->renderResults($mysqli, $tableName, $showCounts, $showPercentages);
        }
        return $this;
    }
} // end of Survey



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

    public $results;
    public $includeInResults = true;

    protected static $itemIdCount = 1;
    public $itemId;

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

    public function getResults($mysqli, $tableName) {
        if (!$this->results)
            $this->results = new ItemResults($this, $mysqli, $tableName);
        return $this->results;
    }

    public function renderResults($mysqli, $tableName, $showCounts, $showPercentages) {
        return $this;
    }

    public function render() {
        $this->renderHeader();
        echo <<<ROW
        <div class="container">
        <div class="row">
        <div class="col-12 col-md-8 col-lg-7">
ROW;
        $this->renderBody();
        echo "</div>\n<div class='col-12 col-md-4 col-lg-5 mt-2 mt-md-0'>";
        $this->renderExtras();
        echo "</div>\n</div>\n</div>\n";
        $this->renderFooter();
        return $this;
    }

    protected function renderHeader() {
        $decoration = "";
        if ($this->required)
            $decoration = '<span class="required"> * </span>';
        echo <<<Q
    <div class="surveyItem surveyItem-{$this->itemType}" 
    id="$this->itemId" 
    data-instrument_code="$this->instrumentCode" 
    data-construct_code="$this->constructCode" 
    data-item_code="$this->itemCode"
    data-item_type="$this->itemType">
    <div class="itemHeader">
    <p class="itemPrompt">$this->prompt $decoration</p>
    <p class="itemSubprompt">$this->subprompt</p>
    </div>
Q;
    }

    protected function renderBody() {}

    protected function renderExtras() {
        if ($this->allowNA) {
            echo <<<NA
    <div class="form-check">
    <label class="form-check-label">
        <input type="checkbox" class="surveyItem-extra na form-check-input">
        Not applicable
    </label>
    </div>
NA;
        }
        if ($this->allowDontUnderstand) {
            echo <<<DU
    <div class="form-check">
    <label class="form-check-label">
        <input type="checkbox" class="surveyItem-extra dont_understand form-check-input">
        I don't understand the question
    </label>
    </div>
DU;
        }
        if ($this->allowDecline) {
            echo <<<DEC
    <div class="form-check">
    <label class="form-check-label">
        <input type="checkbox" class="surveyItem-extra decline_to_answer form-check-input">
        I prefer not to answer
    </label>
    </div>
DEC;
        }
    }

    protected function renderFooter() {
        echo "</div>\n";
    }
} // end of SurveyItem


class ItemGroup {
    public $groupType = "basic";
    protected $items = [];
    public $prompt;
    public $subprompt;
    public $groupCode;
    public $defaultInstrumentCode;
    public $defaultConstructCode;
    public $properties;
    public $groupId;
    protected static $groupIdCount = 1;
    public $includeInResults = true;


    public function __construct($prompt, $subprompt, $defaultInstrumentCode, $defaultConstructCode, $groupCode, $properties=[])
    {
        $this->prompt = $prompt;
        $this->subprompt = $subprompt;
        $this->groupCode = $groupCode;
        $this->defaultInstrumentCode = $defaultInstrumentCode;
        $this->defaultConstructCode = $defaultConstructCode;
        $this->setProperties($properties);
        if (!$groupCode || "" == $groupCode)
            $this->groupCode = "group_" . ItemGroup::$groupIdCount;
        $this->groupId = "itemGroup" . ItemGroup::$groupIdCount++;
    }

    public function setProperties($dict) {
        foreach ($dict as $name => $value)
            $this->$name = $value;
        return $this;
    }

    public function addItem($surveyItem) {
        $this->items[] = $surveyItem;
        return $this;
    }

    public function render() {
        $this->renderHeader();
        $this->renderBody();
        $this->renderFooter();
        return $this;
    }

    protected function renderHeader() {
        echo <<<Q
    <div class="itemGroup itemGroup_$this->groupType" id="$this->groupId" data-group_code="$this->groupCode">
    <div class="itemHeader">
    <p class="itemPrompt">$this->prompt</p>
    <p class="itemSubprompt">$this->subprompt</p>
    </div>
Q;
    }

    protected function renderBody() {
        // render individual survey items
        foreach ($this->items as $item) {
            $item->render();
        }
    }

    protected function renderFooter() {
        echo "</div>\n";
    }
}

class SurveyPage extends ItemGroup {
    public $submitButtonText = "Next";
    public $completed = false;
    protected static $pageCount = 1;
    public $pageNumber;

    public function __construct($prompt, $subprompt, $defaultInstrumentCode, $defaultConstructCode, $pageCode, $properties = [])
    {
        parent::__construct($prompt, $subprompt, $defaultInstrumentCode, $defaultConstructCode, $pageCode, $properties);
        $this->groupType = "surveyPage";
        $this->pageNumber = SurveyPage::$pageCount++;
    }

    public function renderResults($mysqli, $tableName, $showCounts, $showPercentages) {
        echo <<<Q
    <div class="resultsGroup" 
    data-group_code="$this->groupCode" 
    data-page_number="$this->pageNumber">
    <div class="itemHeader">
    <h2 class="itemPrompt">$this->prompt</h2>
    <p class="itemSubprompt">$this->subprompt</p>
    </div>
Q;
        foreach ($this->items as $item) {
            if ($item->includeInResults)
                $item->renderResults($mysqli, $tableName, $showCounts, $showPercentages);
        }
        echo("</div>");
        return $this;
    }

    protected function renderHeader() {
        echo <<<Q
    <div class="itemGroup itemGroup_$this->groupType" 
    id="$this->groupId" 
    data-group_code="$this->groupCode" 
    data-page_completed="0"
    data-page_included="1"
    data-page_number="$this->pageNumber">
    <div class="itemHeader">
    <h2 class="itemPrompt">$this->prompt</h2>
    <p class="itemSubprompt">$this->subprompt</p>
    </div>
Q;
    }

    protected function renderFooter() {
        echo <<< PF
        <div class="text-right">
        <div class="survey-btn btn btn-primary btn-lg survey-submit-button page-submit-button"> 
            $this->submitButtonText
        </div>
    </div>
PF;
        parent::renderFooter();
    }
}


class ScaleItemGroup extends ItemGroup {
    public $leftAnchor;
    public $rightAnchor;
    public $scaleSize = 5;
    public $defaultProperties;
    public $allowNA = false;


    public function __construct($prompt, $subprompt, $defaultInstrumentCode, $defaultConstructCode, $groupCode, $leftAnchor, $rightAnchor, $properties = [])
    {
        parent::__construct($prompt, $subprompt, $defaultInstrumentCode, $defaultConstructCode, $groupCode, $properties);
        $this->leftAnchor = $leftAnchor;
        $this->rightAnchor = $rightAnchor;
        $this->defaultProperties = $properties;
        $this->groupType = "scaleItemGroup";
    }

    public function addScaleItem($prompt, $instrumentCode, $constructCode, $itemCode, $reverseCoded = null) {
        if (!$instrumentCode)
            $instrumentCode = $this->defaultInstrumentCode;
        if (!$constructCode)
            $constructCode = $this->defaultConstructCode;
        $newScaleItem = new ScaleItem($prompt, "", $instrumentCode, $constructCode, $itemCode,
            $this->leftAnchor, $this->rightAnchor, $this->defaultProperties);
        if ($reverseCoded != null)
            $newScaleItem->reverseCoded = $reverseCoded;
        $this->addItem($newScaleItem);
        return $this;
    }

    public function renderResults($mysqli, $tableName, $showCounts, $showPercentages) {
        echo <<< RH
<div class="groupResults groupResults-scaleItemGroup"">
    <div class="itemResultsHeader">
    <p class="itemPrompt">{$this->prompt}</p>
    <p class="itemSubprompt">{$this->subprompt}</p>
    </div>
    <div class="container itemResultsContainer">
    <table class="table table-sm"><tbody>
RH;

        foreach ($this->items as $i => $item) {
            echo('<tr><td style="vertical-align: middle">' . $item->prompt . '</td><td>');
            $item->getResults($mysqli, $tableName)->showHeaderFooter = false;
            $item->getResults($mysqli, $tableName)->maxBarHeight = 50;
            $item->renderResults($mysqli, $tableName, $showCounts, $showPercentages);
            echo('</td></tr>');
        }
        echo <<< IGF
    </tbody></table>
</div></div>
IGF;
        return $this;
    }

    protected function renderBody()
    {
        echo('<table class=""><thead><tr><th style="min-width: 100px"></th><th colspan="2" class="scaleItemGroupLeftColumn scaleLabel py-3 py-md-2">' . $this->leftAnchor . '</th>');
        for($i=2; $i<=$this->scaleSize-1; $i++)
            echo('<th></th>');
        echo('<th class="scaleItemGroupRightColumn scaleLabel">' . $this->rightAnchor . '</th>');
        if ($this->allowNA)
            echo('<th class="scaleLabel pl-2">Not applicable</th>');
        echo('</tr></thead><tbody>');
        foreach ($this->items as $i => $item)
            $this->renderItem($i + 1, $item);
        echo <<< IGF
    </tbody></table>
IGF;
    }

    private function renderItem($itemNumber, $item) {
        $values = $item->reverseCoded ? range($this->scaleSize, 1, -1) : range(1, $this->scaleSize);
        $decoration = "";
//        if ($itemNumber % 2 == 0)
//            $decoration = "evenRow";
        echo <<< SIH
        <tr class="surveyItem surveyItem-scale $decoration" 
        id="$item->itemId" 
        data-instrument_code="$item->instrumentCode" 
        data-construct_code="$item->constructCode" 
        data-item_code="$item->itemCode"
        data-item_type="$item->itemType">
        <th colspan="2" class="itemPrompt">$item->prompt</th>
SIH;
        for ($i=1; $i<=$this->scaleSize; $i++) {
            if ($i == 1)
                echo('<td class="scaleItemGroupLeftColumn py-3 py-md-2">');
            elseif ($i == $this->scaleSize)
                echo('<td class="scaleItemGroupRightColumn">');
            else
                echo('<td>');

            echo('<input class="response" type="radio" name="' . $item->itemCode . '" id="' . $item->itemId . "_" . $i . '" value="' . $values[$i-1] . '"></td>');
        }

        if ($this->allowNA)
            echo('<td style="text-align: center"><input type="checkbox" class="surveyItem-extra na"></td>');
        echo('</tr>');
    }
}


class StaticItem extends surveyItem {

    public function __construct($prompt, $subprompt = "") {
        parent::__construct($prompt, $subprompt, "", "", "");
        $this->itemType = "static";
    }

    public function renderResults($mysqli, $tableName, $showCounts, $showPercentages) {
        if (!$this->results)
            $this->results = new ItemResults($this, $mysqli, $tableName);
        $this->results->renderNoContent();
        return $this;
    }


    public function render() {
        $this->renderHeader();
        $this->renderFooter();
        return $this;
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

    public function renderResults($mysqli, $tableName, $showCounts, $showPercentages, $showLabels = true) {
        if (!$this->results)
            $this->results = new ItemResults($this, $mysqli, $tableName);
        $options = [["option_key" => 1, "option_label" => $this->leftAnchor]];
        for ($i=2; $i<$this->scaleSize; $i++)
            $options[] = ["option_key" => $i, "option_label" => ""];
        $options[] = ["option_key" => $this->scaleSize, "option_label" => $this->rightAnchor];
        $this->results->renderHorizontalHistogram($showCounts, $showPercentages, $showLabels, $options);
    }

    protected function renderBody() {
        $values = $this->reverseCoded ? range($this->scaleSize, 1, -1) : range(1, $this->scaleSize);
        echo <<<LQ
    <div class="row">
        <div class="col-3 col-sm-3 text-right">
            <label for="{$this->itemId}_1">$this->leftAnchor</label>
        </div>
        <div class="col-auto">
        <input class="response" type="radio" name="$this->itemCode" id="{$this->itemId}_1" value="$values[0]">
LQ;
        for ($i=2; $i<$this->scaleSize; $i++) {
            echo('<input class="response" type="radio" name="' . $this->itemCode . '" id="' . $this->itemId . "_" . $i . '" value="' . $values[$i-1] . '">');
        }
        echo <<< LQ
            <input class="response" type="radio" name="$this->itemCode" id="{$this->itemId}_{$this->scaleSize}" value="{$values[$this->scaleSize-1]}">
        </div>
        <div class="col-3 col-sm-3 text-left">
            <label for="{$this->itemId}_{$this->scaleSize}">$this->rightAnchor</label>
        </div>
    </div>
LQ;
    }
}


class ChooseMultipleItem extends SurveyItem {
    public $optionsToChooseFrom;

    public function __construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $options, $properties = [])
    {
        parent::__construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $properties);
        $this->optionsToChooseFrom = $options;
        $this->itemType = "chooseMultiple";
    }

    public function renderResults($mysqli, $tableName, $showCounts, $showPercentages) {
        if (!$this->results)
            $this->results = new ItemResults($this, $mysqli, $tableName);
        $this->results->renderVerticalHistogram($showCounts, $showPercentages, $this->optionsToChooseFrom);
    }

    protected function renderBody()
    {
        for ($i=1; $i<=count($this->optionsToChooseFrom); $i++) {
            $tempId = $this->itemId . "_" . $i;
            $allowFreeResponse = false;
            if (isset($this->optionsToChooseFrom[$i-1]['allow_free_response']) && $this->optionsToChooseFrom[$i-1]['allow_free_response'])
                $allowFreeResponse = true;
            if ($allowFreeResponse)
                echo <<<CMFR
    <div class="form-inline">
        <div class="form-check">
        <input type="checkbox" class="form-check-input choose-multiple-value has-free-response" 
        name="{$this->itemCode}_{$this->optionsToChooseFrom[$i - 1]['option_key']}" 
        id="$tempId"
        data-free_response_id="{$tempId}_free_response" 
        value="{$this->optionsToChooseFrom[$i - 1]['option_key']}"/>
        <label class="form-check-label" for="$tempId">{$this->optionsToChooseFrom[$i - 1]['option_label']}</label>
        </div>
        <div class="form-group">
        &nbsp;<input class="form-control free-response" 
        name="{$this->itemCode}_{$this->optionsToChooseFrom[$i - 1]['option_key']}_free_response"
        id="{$tempId}_free_response"/>
        </div>
    </div>
CMFR;
            else echo <<<CM
    <div class="form-check">
    <input type="checkbox" class="form-check-input choose-multiple-value" name="{$this->itemCode}_{$this->optionsToChooseFrom[$i - 1]['option_key']}" id="$tempId" value="{$this->optionsToChooseFrom[$i - 1]['option_key']}"/>
    <label class="form-check-label" for="$tempId">{$this->optionsToChooseFrom[$i - 1]['option_label']}</label>
    </div>
CM;
        }
    }

}

class ChooseOneItem extends SurveyItem {
    public $optionsToChooseFrom;
    public $results;

    /**
     * ChooseOneItem constructor.
     * @param $prompt
     * @param $subprompt
     * @param $instrumentCode
     * @param $constructCode
     * @param $itemCode
     * @param $options specified as an array of options to choose from expressed as
     * ["option_key" => "o2", "option_label" => "Second option"]
     * @param array $properties
     */
    public function __construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $options, $properties = [])
    {
        parent::__construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $properties);
        $this->optionsToChooseFrom = $options;
        $this->itemType = "chooseOne";
    }

    public function renderResults($mysqli, $tableName, $showCounts, $showPercentages) {
        if (!$this->results)
            $this->results = new ItemResults($this, $mysqli, $tableName);
        $this->results->renderVerticalHistogram($showCounts, $showPercentages, $this->optionsToChooseFrom);
    }

    protected function renderBody()
    {
        // if there are fewer than 10 options, show as radio buttons; otherwise, use a pull down
        $presentAsRadioButtons = (count($this->optionsToChooseFrom) < 10);

        if ($presentAsRadioButtons) {
//            echo('<div class="form-group">');
            for ($i=1; $i<=count($this->optionsToChooseFrom); $i++) {
                $tempId = $this->itemId . "_" . $i;
                $allowFreeResponse = false;
                if (isset($this->optionsToChooseFrom[$i-1]['allow_free_response']) && $this->optionsToChooseFrom[$i-1]['allow_free_response'])
                    $allowFreeResponse = true;
                if ($allowFreeResponse)
                    echo <<<CMFR
    <div class="form-inline">
        <div class="form-check">
        <input type="radio" class="form-check-input choose-one-value has-free-response" 
        name="{$this->itemCode}" 
        id="$tempId"
        data-free_response_id="{$tempId}_free_response" 
        value="{$this->optionsToChooseFrom[$i - 1]['option_key']}"/>
        <label class="form-check-label" for="$tempId">{$this->optionsToChooseFrom[$i - 1]['option_label']}</label>
        </div>
        <div class="form-group">
        &nbsp;<input class="form-control free-response" 
        name="{$this->itemCode}_{$this->optionsToChooseFrom[$i - 1]['option_key']}_free_response"
        id="{$tempId}_free_response"/>
        </div>
    </div>
CMFR;
                else echo <<<CO
    <div class="form-check">
    <input type="radio" class="form-check-input choose-one-value" name="$this->itemCode" id="$tempId" value="{$this->optionsToChooseFrom[$i - 1]['option_key']}"/>
    <label class="form-check-label" for="$tempId">{$this->optionsToChooseFrom[$i - 1]['option_label']}</label>
    </div>
CO;
            }
//            echo('</div>');
        } else {
            echo('<select class="form-control" id="' . $this->itemId . '_select" name="' . $this->itemCode . '">');
            for ($i=1; $i<=count($this->optionsToChooseFrom); $i++) {
                echo <<< COS
    <option value="{$this->optionsToChooseFrom[$i - 1]['option_key']}">{$this->optionsToChooseFrom[$i - 1]['option_label']}</option>
COS;
            }
            echo('</select>');
        }
    }
}


class ChooseCountryItem extends ChooseOneItem {

    public function __construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $properties = [])
    {
        parent::__construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode,
            array_merge([["option_key" => "", "option_label" => ""]], COUNTRIES), $properties);
    }
}

class ChooseIntegerItem extends ChooseOneItem
{
    public $min;
    public $max;

    public function __construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $min, $max, $properties = [])
    {
        $options = [["option_key" => "", "option_label" => ""]];
        for ($i = $min; $i <= $max; $i++)
            $options[] = ["option_key" => $i, "option_label" => $i];
        parent::__construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $options, $properties);
        $this->itemType = "chooseOneInt";
    }

    public function renderResults($mysqli, $tableName, $showCounts, $showPercentages)
    {
        if (!$this->results)
            $this->results = new ItemResults($this, $mysqli, $tableName);
        $this->results->renderSummaryStatistics();
        return $this;
    }
}


class NumberItem extends SurveyItem {

    public function __construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $properties = [])
    {
        parent::__construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $properties);
        $this->itemType = "number";
    }

    protected function renderBody()
    {
        echo <<< NI
    <input class="form-control" name="$this->itemCode" id="{$this->itemId}_input" size="10"/>
NI;

    }
}

class LongTextItem extends SurveyItem {

    public function __construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $properties = [])
    {
        parent::__construct($prompt, $subprompt, $instrumentCode, $constructCode, $itemCode, $properties);
        $this->itemType = "longText";
    }

    protected function renderBody()
    {
        echo <<< LT
    <textarea class="form-control" rows="3"></textarea>
LT;
    }

    public function renderResults($mysqli, $tableName, $showCounts, $showPercentages) {
        if (!$this->results)
            $this->results = new ItemResults($this, $mysqli, $tableName);
        $this->results->renderSampleOfFreeResponses($this->results->numFreeResponsesToShow);
    }

}

/****************************************************
 ******* COMPUTING RESULTS **************************
 ****************************************************/

class ItemResults {

    public $surveyItem;
    protected $mysqli;
    protected $tableName;

    // presentation
    public $minNToShowResults = 5;
    public $maxOptionsToShow = 10;
    public $numFreeResponsesToShow = 5;
    public $showOptionsWithNoResponses = false;
    public $maxBarHeight = 75;
    public $showScaleValues = false;
    public $showHeaderFooter = true;

    // results
    protected $n_presented;
    protected $n_responded;
    // this is the number of non-null responses that have been explicitly approved to be shown in results
    protected $n_responded_and_approved;
    protected $mean;
    protected $stdev;
    protected $max;
    protected $min;
    protected $countsByOptionKey;
    protected $optionLabelsByOptionKey = [];
    protected $freeResponses;


    public $VALUE_TYPES = [
        "scale" => "value_int",
        "number" => "value_float",
        "chooseOneInt" => "value_int",
        "chooseOne" => "value_text",
        "longText" => "value_text"
        ];

    public function __construct($surveyItem, $mysqli, $tableName)
    {
        $this->surveyItem = $surveyItem;
        $this->mysqli = $mysqli;
        $this->tableName = $tableName;
    }

    public function getCountsByOptionKey($options = []) {
        if (!$this->countsByOptionKey) {
            $valueType = $this->VALUE_TYPES[$this->surveyItem->itemType];
            $countsQuery = "select item_code, " . $valueType . " as value , count(id) as n from " . $this->tableName
                . " where item_code = \"" . $this->surveyItem->itemCode . "\" group by " . $valueType . " order by " . $valueType;
            $res = getQueryResultAsArray($this->mysqli, $countsQuery, "value");
            $this->countsByOptionKey = [];
            foreach ($options as $option) {
                $this->countsByOptionKey[$option["option_key"]] = 0;
                $this->optionLabelsByOptionKey[$option["option_key"]] = $option["option_label"];
            }
            foreach ($res as $val => $data) {
                $this->countsByOptionKey[$val] = intval($data["n"]);
            }
        }
        return $this->countsByOptionKey;
    }

    public function getCountsForSelectMultiple($options = []) {
        if (!$this->countsByOptionKey) {
            $query = <<< QQ
select value_text from $this->tableName
where item_code = "{$this->surveyItem->itemCode}"
and value_text != ""
QQ;
            $res = getQueryResultAsArray($this->mysqli, $query);
            $this->n_responded = count($res);
            foreach ($options as $option) {
                $this->countsByOptionKey[$option["option_key"]] = 0;
                $this->optionLabelsByOptionKey[$option["option_key"]] = $option["option_label"];
            }
            foreach($res as $row) {
                $vals = explode(", ", $row["value_text"]);
                foreach($vals as $val) {
                    if (!isset($this->countsByOptionKey[$val]))
                        $this->countsByOptionKey[$val] = 1;
                    else
                        $this->countsByOptionKey[$val] = $this->countsByOptionKey[$val] + 1;
                }
            }
        }
        return $this->countsByOptionKey;
    }

    public function getFreeResponses($numToFetch) {
        if (!$this->freeResponses || count($this->freeResponses) < $numToFetch) {
            $query = <<< QQ
select value_text from $this->tableName
where item_code = "{$this->surveyItem->itemCode}"
and show_in_results = 1
and value_text != ""
and not isnull(value_text)
order by rand()
limit $numToFetch 
QQ;
            $res = getQueryResultAsArray($this->mysqli, $query);
            $this->freeResponses = [];
            foreach ($res as $row)
                $this->freeResponses[] = $row["value_text"];
        }
        return $this->freeResponses;
    }

    protected function sortOptionsByCount() {
        return arsort($this->countsByOptionKey);
    }

    public function getNResponded($approvedOnly = false) {
        if ($approvedOnly) {
            if (!isset($this->n_responded_and_approved)) {
                $valueType = $this->VALUE_TYPES[$this->surveyItem->itemType];
                $query = "select count(id) as n from " . $this->tableName
                    . " where show_in_results = 1 and item_code = \"" . $this->surveyItem->itemCode . "\" and " . $valueType . " is not null and " . $valueType . " != \"\"";
                $res = mysqli_query($this->mysqli, $query);
                if ($res)
                    $this->n_responded_and_approved = intval($res->fetch_row()[0]);
            }
            return $this->n_responded_and_approved;
        } else {
            if (!isset($this->n_responded)) {
                if ($this->countsByOptionKey) {
                    // if we have already retrieved value counts, use those to calculate the number of respondents without
                    // touching db
                    $this->n_responded = 0;
                    foreach ($this->countsByOptionKey as $val => $count) {
                        if ("" != $val)
                            $this->n_responded = $this->n_responded + $count;
                    }
                } else {
                    // otherwise, run a db query
                    $valueType = $this->VALUE_TYPES[$this->surveyItem->itemType];
                    $query = "select count(id) as n from " . $this->tableName
                        . " where item_code = \"" . $this->surveyItem->itemCode . "\" and " . $valueType . " is not null and \" . $valueType . \" != \"\"";
                    $res = mysqli_query($this->mysqli, $query);
                    if ($res)
                        $this->n_responded = intval($res->fetch_row()[0]);
                }
            }
            return $this->n_responded;
        }
        // we should never get here
        return null;
    }

    /**
     * @param string $valueType which value column to use in db: value_int or value_float -- default is value_int
     * @return mixed
     */
    public function getSummaryStatistics($valueType = "value_int") {
        if (!isset($this->mean)) {
            $query = <<< SS
            select avg($valueType) as mean, count($valueType) as n, std($valueType) as std,
                   min($valueType) as min, max($valueType) as max
            from $this->tableName
            where item_code = "{$this->surveyItem->itemCode}"
SS;
            $res = mysqli_query($this->mysqli, $query);
            if ($res) {
                $row = $res->fetch_assoc();
                $this->n_responded = $row["n"];
                $this->mean = $row["mean"];
                $this->stdev = $row["std"];
                $this->min = $row["min"];
                $this->max = $row["max"];
            }
        }
        return $this->mean;
    }

    public function getNPresented() {
        if (!$this->n_presented) {
            if ($this->countsByOptionKey) {
                // if we have already retrieved value counts, use those to calculate the number of respondents without
                // touching db
                $this->n_presented = 0;
                foreach ($this->countsByOptionKey as $val => $count)
                        $this->n_presented = $this->n_presented + $count;
            } else {
                // otherwise, run a db query
                $query = "select count(id) as n from " . $this->tableName
                    . " where item_code = \"" . $this->surveyItem->itemCode . "\"";
                $res = mysqli_query($this->mysqli, $query);
                if ($res)
                    $this->n_presented = intval($res->fetch_row()[0]);
            }
        }
        return $this->n_presented;
    }

    protected function enoughResponsesReceived($approvedOnly = false) {
        return $this->getNResponded($approvedOnly) >= $this->minNToShowResults;
    }

    protected function ensureEnoughResponses($approvedOnly = false) {
        if (!$this->enoughResponsesReceived($approvedOnly)) {
            echo <<< TFR
    <div class="tooFewResponses">
    Not enough responses received to show results at this time.
</div>
TFR;
            return false;
        }
        return true;
    }

    protected function renderHeader() {
        if ($this->showHeaderFooter)
            echo <<< RH
<div class="itemResults itemResults-{$this->surveyItem->itemType}" data-item_code="{$this->surveyItem->itemCode}">
    <div class="itemResultsHeader">
    <p class="itemPrompt">{$this->surveyItem->prompt}</p>
    <p class="itemSubprompt">{$this->surveyItem->subprompt}</p>
    </div>
    <div class="container itemResultsContainer">
RH;
        return $this;
    }

    protected function renderFooter() {
        if ($this->showHeaderFooter)
            echo <<< RF
</div></div>
RF;
        return $this;
    }

    public function renderNoContent() {
        $this->renderHeader();
        $this->renderFooter();
        return $this;
    }

    public function renderSampleOfFreeResponses() {
        // for now, if we do not have enough responses for an open-ended question, we do not even show that question
        // among the responses. This is because responses to open-ended questions need to be approved first so we do not
        // want to show many questions with not enough responses if the research team is lagging in approving responses
        if ($this->enoughResponsesReceived(true)) {
            $this->renderHeader();
            $this->getFreeResponses($this->numFreeResponsesToShow);
            echo('<p>Here is a random sample of responses:</p>');
            foreach ($this->freeResponses as $freeResponse) {
                echo('<div class="freeResponseQuote">"' . $freeResponse . '"</div>');
            }
            $this->renderFooter();
        }
        return $this;
    }

    public function renderSummaryStatistics()
    {
        $this->renderHeader();
        $this->getSummaryStatistics();
        if ($this->ensureEnoughResponses()) {
            $formattedMean = number_format($this->mean, 2);
            $formattedStdev = number_format($this->stdev, 2);
            echo <<< SSS
            <div class="summaryStatistics">
            Range: $this->min -- $this->max 
(Mean: $formattedMean, standard deviation: $formattedStdev)
            </div>
SSS;
        }
        $this->renderFooter();
        return $this;
    }

    public function renderVerticalHistogram($showCounts, $showPercentages, $options = []) {
        $this->renderHeader();
        if ($this->surveyItem->itemType == "chooseMultiple")
            $this->getCountsForSelectMultiple($options);
        else
            $this->getCountsByOptionKey($options);
        if (count($this->countsByOptionKey) > $this->maxOptionsToShow)
            $this->sortOptionsByCount();
        $this->showOptionsWithNoResponses = $this->showOptionsWithNoResponses || count($this->countsByOptionKey) <= $this->maxOptionsToShow;
        if ($this->ensureEnoughResponses()) {
            echo('<table class="table table-sm" style="wdith: 100%"><thead><th style="width: 40%">Response</th>');
            if ($showCounts)
                echo('<th style="width: 4em">N</th>');
            if ($showPercentages)
                echo('<th style="width: 4em"></th>');
//                echo('<th>Percentage</th>');
            echo('<th></th></thead>');
            $cnt = 1;
            foreach ($this->countsByOptionKey as $value => $count) {
                if ("" !== $value && ($this->showOptionsWithNoResponses || $count)) {
                    $c = ($cnt <= $this->maxOptionsToShow) ? "optionShown" : "optionNotShown";
                    if (isset($this->optionLabelsByOptionKey[$value]))
                        $value = $this->optionLabelsByOptionKey[$value];
                    $percentage = 100 * $count / $this->getNResponded();
                    echo('<tr class="' . $c . '"><td>' . $value . '</td>');
                    if ($showCounts)
                        echo('<td>' . $count . '</td>'); // count
                    if ($showPercentages)
                        echo('<td>' . number_format($percentage) . '%</td>');
                    echo('<td><span class="bar" style="min-height: 20px; width: ' . $percentage . '%"></span></td>');
                    echo('</tr>');
                    $cnt = $cnt+1;
                }
            }
            echo('</table>');
            if ($cnt > $this->maxOptionsToShow)
                echo("<p><i>Showing " . $this->maxOptionsToShow . " most popular responses</i></p>");
            if ($this->surveyItem->itemType == "chooseMultiple" && $showPercentages)
                echo("<p><i>Because respondents could select multiple options each, percentages may add up to more than 100%.</i></p>");

        }
        $this->renderFooter();
        return $this;
    }

    public function renderHorizontalHistogram($showCounts, $showPercentages, $showLabels, $options = []) {
        $this->renderHeader();
        $this->getCountsByOptionKey($options);
        if ($this->ensureEnoughResponses()) {
            echo('<table class="horizontalHistogram ">');
            echo('<tr><th style="padding-bottom: 0px"></th>');
            foreach ($this->countsByOptionKey as $value => $count) {
                $percentage = 100 * $count / $this->getNResponded();
                $barHeight = $percentage * $this->maxBarHeight / 100;
                if ("" !== $value)
                    echo('<td style="vertical-align: bottom; padding-bottom: 0px; height: ' . $this->maxBarHeight . 'px"><span class="bar" style="height: ' . $barHeight . 'px"></span></td>');
            }
            echo('</tr>');
            if ($showPercentages) {
//                echo('<tr><th>Percentage</th>');
                echo('<tr><th></th>');
                foreach ($this->countsByOptionKey as $value => $count) {
                    $percentage = 100 * $count / $this->getNResponded();
                    if ("" !== $value)
                        echo('<td>' . number_format($percentage) . '%</td>'); // percentage
                }
                echo('</tr>');
            }
            if ($showCounts) {
                echo('<tr><th>N</th>');
                foreach ($this->countsByOptionKey as $value => $count) {
                    if ("" !== $value)
                        echo('<td>' . $count . '</td>'); // count
                }
                echo('</tr>');
            }
            if ($this->showScaleValues) {
                echo('<tr><th>Response</th>');
                foreach ($this->countsByOptionKey as $value => $count) {
                    if ("" !== $value)
                        echo('<th>' . $value . '</th>');
                }
                echo('</tr>');
            }
            if ($showLabels) {
                echo('<tr class="labelsRow"><th></th>');
                foreach ($this->countsByOptionKey as $value => $count) {
                    if ("" !== $value)
                        echo('<td>' . $this->optionLabelsByOptionKey[$value] . '</td>');
                }
                echo('</tr>');
            }
            echo('</table>');
        }
        $this->renderFooter();
        return $this;
    }

}


define("COUNTRIES", [
    ["option_key" => "AF", "option_label" => "Afghanistan"],
    ["option_key" => "AX", "option_label" => "Åland Islands"],
    ["option_key" => "AL", "option_label" => "Albania"],
    ["option_key" => "DZ", "option_label" => "Algeria"],
    ["option_key" => "AS", "option_label" => "American Samoa"],
    ["option_key" => "AD", "option_label" => "Andorra"],
    ["option_key" => "AO", "option_label" => "Angola"],
    ["option_key" => "AI", "option_label" => "Anguilla"],
    ["option_key" => "AQ", "option_label" => "Antarctica"],
    ["option_key" => "AG", "option_label" => "Antigua and Barbuda"],
    ["option_key" => "AR", "option_label" => "Argentina"],
    ["option_key" => "AM", "option_label" => "Armenia"],
    ["option_key" => "AW", "option_label" => "Aruba"],
    ["option_key" => "AU", "option_label" => "Australia"],
    ["option_key" => "AT", "option_label" => "Austria"],
    ["option_key" => "AZ", "option_label" => "Azerbaijan"],
    ["option_key" => "BS", "option_label" => "Bahamas (the)"],
    ["option_key" => "BH", "option_label" => "Bahrain"],
    ["option_key" => "BD", "option_label" => "Bangladesh"],
    ["option_key" => "BB", "option_label" => "Barbados"],
    ["option_key" => "BY", "option_label" => "Belarus"],
    ["option_key" => "BE", "option_label" => "Belgium"],
    ["option_key" => "BZ", "option_label" => "Belize"],
    ["option_key" => "BJ", "option_label" => "Benin"],
    ["option_key" => "BM", "option_label" => "Bermuda"],
    ["option_key" => "BT", "option_label" => "Bhutan"],
    ["option_key" => "BO", "option_label" => "Bolivia (Plurinational State of)"],
    ["option_key" => "BQ", "option_label" => "Bonaire"],
    ["option_key" => "BA", "option_label" => "Bosnia and Herzegovina"],
    ["option_key" => "BW", "option_label" => "Botswana"],
    ["option_key" => "BV", "option_label" => "Bouvet Island"],
    ["option_key" => "BR", "option_label" => "Brazil"],
    ["option_key" => "IO", "option_label" => "British Indian Ocean Territory (the)"],
    ["option_key" => "BN", "option_label" => "Brunei Darussalam"],
    ["option_key" => "BG", "option_label" => "Bulgaria"],
    ["option_key" => "BF", "option_label" => "Burkina Faso"],
    ["option_key" => "BI", "option_label" => "Burundi"],
    ["option_key" => "CV", "option_label" => "Cabo Verde"],
    ["option_key" => "KH", "option_label" => "Cambodia"],
    ["option_key" => "CM", "option_label" => "Cameroon"],
    ["option_key" => "CA", "option_label" => "Canada"],
    ["option_key" => "KY", "option_label" => "Cayman Islands (the)"],
    ["option_key" => "CF", "option_label" => "Central African Republic (the)"],
    ["option_key" => "TD", "option_label" => "Chad"],
    ["option_key" => "CL", "option_label" => "Chile"],
    ["option_key" => "CN", "option_label" => "China"],
    ["option_key" => "CX", "option_label" => "Christmas Island"],
    ["option_key" => "CC", "option_label" => "Cocos (Keeling) Islands (the)"],
    ["option_key" => "CO", "option_label" => "Colombia"],
    ["option_key" => "KM", "option_label" => "Comoros (the)"],
    ["option_key" => "CD", "option_label" => "Congo (the Democratic Republic of the)"],
    ["option_key" => "CG", "option_label" => "Congo (the)"],
    ["option_key" => "CK", "option_label" => "Cook Islands (the)"],
    ["option_key" => "CR", "option_label" => "Costa Rica"],
    ["option_key" => "CI", "option_label" => "Côte d'Ivoire"],
    ["option_key" => "HR", "option_label" => "Croatia"],
    ["option_key" => "CU", "option_label" => "Cuba"],
    ["option_key" => "CW", "option_label" => "Curaçao"],
    ["option_key" => "CY", "option_label" => "Cyprus"],
    ["option_key" => "CZ", "option_label" => "Czechia"],
    ["option_key" => "DK", "option_label" => "Denmark"],
    ["option_key" => "DJ", "option_label" => "Djibouti"],
    ["option_key" => "DM", "option_label" => "Dominica"],
    ["option_key" => "DO", "option_label" => "Dominican Republic (the)"],
    ["option_key" => "EC", "option_label" => "Ecuador"],
    ["option_key" => "EG", "option_label" => "Egypt"],
    ["option_key" => "SV", "option_label" => "El Salvador"],
    ["option_key" => "GQ", "option_label" => "Equatorial Guinea"],
    ["option_key" => "ER", "option_label" => "Eritrea"],
    ["option_key" => "EE", "option_label" => "Estonia"],
    ["option_key" => "SZ", "option_label" => "Eswatini"],
    ["option_key" => "ET", "option_label" => "Ethiopia"],
    ["option_key" => "FK", "option_label" => "Falkland Islands (the)"],
    ["option_key" => "FO", "option_label" => "Faroe Islands (the)"],
    ["option_key" => "FJ", "option_label" => "Fiji"],
    ["option_key" => "FI", "option_label" => "Finland"],
    ["option_key" => "FR", "option_label" => "France"],
    ["option_key" => "GF", "option_label" => "French Guiana"],
    ["option_key" => "PF", "option_label" => "French Polynesia"],
    ["option_key" => "TF", "option_label" => "French Southern Territories (the)"],
    ["option_key" => "GA", "option_label" => "Gabon"],
    ["option_key" => "GM", "option_label" => "Gambia (the)"],
    ["option_key" => "GE", "option_label" => "Georgia"],
    ["option_key" => "DE", "option_label" => "Germany"],
    ["option_key" => "GH", "option_label" => "Ghana"],
    ["option_key" => "GI", "option_label" => "Gibraltar"],
    ["option_key" => "GR", "option_label" => "Greece"],
    ["option_key" => "GL", "option_label" => "Greenland"],
    ["option_key" => "GD", "option_label" => "Grenada"],
    ["option_key" => "GP", "option_label" => "Guadeloupe"],
    ["option_key" => "GU", "option_label" => "Guam"],
    ["option_key" => "GT", "option_label" => "Guatemala"],
    ["option_key" => "GG", "option_label" => "Guernsey"],
    ["option_key" => "GN", "option_label" => "Guinea"],
    ["option_key" => "GW", "option_label" => "Guinea-Bissau"],
    ["option_key" => "GY", "option_label" => "Guyana"],
    ["option_key" => "HT", "option_label" => "Haiti"],
    ["option_key" => "HM", "option_label" => "Heard Island and McDonald Islands"],
    ["option_key" => "VA", "option_label" => "Holy See (the)"],
    ["option_key" => "HN", "option_label" => "Honduras"],
    ["option_key" => "HK", "option_label" => "Hong Kong"],
    ["option_key" => "HU", "option_label" => "Hungary"],
    ["option_key" => "IS", "option_label" => "Iceland"],
    ["option_key" => "IN", "option_label" => "India"],
    ["option_key" => "ID", "option_label" => "Indonesia"],
    ["option_key" => "IR", "option_label" => "Iran (Islamic Republic of)"],
    ["option_key" => "IQ", "option_label" => "Iraq"],
    ["option_key" => "IE", "option_label" => "Ireland"],
    ["option_key" => "IM", "option_label" => "Isle of Man"],
    ["option_key" => "IL", "option_label" => "Israel"],
    ["option_key" => "IT", "option_label" => "Italy"],
    ["option_key" => "JM", "option_label" => "Jamaica"],
    ["option_key" => "JP", "option_label" => "Japan"],
    ["option_key" => "JE", "option_label" => "Jersey"],
    ["option_key" => "JO", "option_label" => "Jordan"],
    ["option_key" => "KZ", "option_label" => "Kazakhstan"],
    ["option_key" => "KE", "option_label" => "Kenya"],
    ["option_key" => "KI", "option_label" => "Kiribati"],
    ["option_key" => "KP", "option_label" => "Korea (the Democratic People's Republic of)"],
    ["option_key" => "KR", "option_label" => "Korea (the Republic of)"],
    ["option_key" => "KW", "option_label" => "Kuwait"],
    ["option_key" => "KG", "option_label" => "Kyrgyzstan"],
    ["option_key" => "LA", "option_label" => "Lao People's Democratic Republic (the)"],
    ["option_key" => "LV", "option_label" => "Latvia"],
    ["option_key" => "LB", "option_label" => "Lebanon"],
    ["option_key" => "LS", "option_label" => "Lesotho"],
    ["option_key" => "LR", "option_label" => "Liberia"],
    ["option_key" => "LY", "option_label" => "Libya"],
    ["option_key" => "LI", "option_label" => "Liechtenstein"],
    ["option_key" => "LT", "option_label" => "Lithuania"],
    ["option_key" => "LU", "option_label" => "Luxembourg"],
    ["option_key" => "MO", "option_label" => "Macao"],
    ["option_key" => "MG", "option_label" => "Madagascar"],
    ["option_key" => "MW", "option_label" => "Malawi"],
    ["option_key" => "MY", "option_label" => "Malaysia"],
    ["option_key" => "MV", "option_label" => "Maldives"],
    ["option_key" => "ML", "option_label" => "Mali"],
    ["option_key" => "MT", "option_label" => "Malta"],
    ["option_key" => "MH", "option_label" => "Marshall Islands (the)"],
    ["option_key" => "MQ", "option_label" => "Martinique"],
    ["option_key" => "MR", "option_label" => "Mauritania"],
    ["option_key" => "MU", "option_label" => "Mauritius"],
    ["option_key" => "YT", "option_label" => "Mayotte"],
    ["option_key" => "MX", "option_label" => "Mexico"],
    ["option_key" => "FM", "option_label" => "Micronesia (Federated States of)"],
    ["option_key" => "MD", "option_label" => "Moldova (the Republic of)"],
    ["option_key" => "MC", "option_label" => "Monaco"],
    ["option_key" => "MN", "option_label" => "Mongolia"],
    ["option_key" => "ME", "option_label" => "Montenegro"],
    ["option_key" => "MS", "option_label" => "Montserrat"],
    ["option_key" => "MA", "option_label" => "Morocco"],
    ["option_key" => "MZ", "option_label" => "Mozambique"],
    ["option_key" => "MM", "option_label" => "Myanmar"],
    ["option_key" => "NA", "option_label" => "Namibia"],
    ["option_key" => "NR", "option_label" => "Nauru"],
    ["option_key" => "NP", "option_label" => "Nepal"],
    ["option_key" => "NL", "option_label" => "Netherlands (the)"],
    ["option_key" => "NC", "option_label" => "New Caledonia"],
    ["option_key" => "NZ", "option_label" => "New Zealand"],
    ["option_key" => "NI", "option_label" => "Nicaragua"],
    ["option_key" => "NE", "option_label" => "Niger (the)"],
    ["option_key" => "NG", "option_label" => "Nigeria"],
    ["option_key" => "NU", "option_label" => "Niue"],
    ["option_key" => "NF", "option_label" => "Norfolk Island"],
    ["option_key" => "MK", "option_label" => "North Macedonia"],
    ["option_key" => "MP", "option_label" => "Northern Mariana Islands (the)"],
    ["option_key" => "NO", "option_label" => "Norway"],
    ["option_key" => "OM", "option_label" => "Oman"],
    ["option_key" => "PK", "option_label" => "Pakistan"],
    ["option_key" => "PW", "option_label" => "Palau"],
    ["option_key" => "PS", "option_label" => "Palestine, State of"],
    ["option_key" => "PA", "option_label" => "Panama"],
    ["option_key" => "PG", "option_label" => "Papua New Guinea"],
    ["option_key" => "PY", "option_label" => "Paraguay"],
    ["option_key" => "PE", "option_label" => "Peru"],
    ["option_key" => "PH", "option_label" => "Philippines (the)"],
    ["option_key" => "PN", "option_label" => "Pitcairn"],
    ["option_key" => "PL", "option_label" => "Poland"],
    ["option_key" => "PT", "option_label" => "Portugal"],
    ["option_key" => "PR", "option_label" => "Puerto Rico"],
    ["option_key" => "QA", "option_label" => "Qatar"],
    ["option_key" => "RE", "option_label" => "Réunion"],
    ["option_key" => "RO", "option_label" => "Romania"],
    ["option_key" => "RU", "option_label" => "Russian Federation (the)"],
    ["option_key" => "RW", "option_label" => "Rwanda"],
    ["option_key" => "BL", "option_label" => "Saint Barthélemy"],
    ["option_key" => "SH", "option_label" => "Saint Helena"],
    ["option_key" => "KN", "option_label" => "Saint Kitts and Nevis"],
    ["option_key" => "LC", "option_label" => "Saint Lucia"],
    ["option_key" => "MF", "option_label" => "Saint Martin (French part)"],
    ["option_key" => "PM", "option_label" => "Saint Pierre and Miquelon"],
    ["option_key" => "VC", "option_label" => "Saint Vincent and the Grenadines"],
    ["option_key" => "WS", "option_label" => "Samoa"],
    ["option_key" => "SM", "option_label" => "San Marino"],
    ["option_key" => "ST", "option_label" => "Sao Tome and Principe"],
    ["option_key" => "SA", "option_label" => "Saudi Arabia"],
    ["option_key" => "SN", "option_label" => "Senegal"],
    ["option_key" => "RS", "option_label" => "Serbia"],
    ["option_key" => "SC", "option_label" => "Seychelles"],
    ["option_key" => "SL", "option_label" => "Sierra Leone"],
    ["option_key" => "SG", "option_label" => "Singapore"],
    ["option_key" => "SX", "option_label" => "Sint Maarten (Dutch part)"],
    ["option_key" => "SK", "option_label" => "Slovakia"],
    ["option_key" => "SI", "option_label" => "Slovenia"],
    ["option_key" => "SB", "option_label" => "Solomon Islands"],
    ["option_key" => "SO", "option_label" => "Somalia"],
    ["option_key" => "ZA", "option_label" => "South Africa"],
    ["option_key" => "GS", "option_label" => "South Georgia and the South Sandwich Islands"],
    ["option_key" => "SS", "option_label" => "South Sudan"],
    ["option_key" => "ES", "option_label" => "Spain"],
    ["option_key" => "LK", "option_label" => "Sri Lanka"],
    ["option_key" => "SD", "option_label" => "Sudan (the)"],
    ["option_key" => "SR", "option_label" => "Suriname"],
    ["option_key" => "SJ", "option_label" => "Svalbard"],
    ["option_key" => "SE", "option_label" => "Sweden"],
    ["option_key" => "CH", "option_label" => "Switzerland"],
    ["option_key" => "SY", "option_label" => "Syrian Arab Republic (the)"],
    ["option_key" => "TW", "option_label" => "Taiwan (Province of China)"],
    ["option_key" => "TJ", "option_label" => "Tajikistan"],
    ["option_key" => "TZ", "option_label" => "Tanzania, the United Republic of"],
    ["option_key" => "TH", "option_label" => "Thailand"],
    ["option_key" => "TL", "option_label" => "Timor-Leste"],
    ["option_key" => "TG", "option_label" => "Togo"],
    ["option_key" => "TK", "option_label" => "Tokelau"],
    ["option_key" => "TO", "option_label" => "Tonga"],
    ["option_key" => "TT", "option_label" => "Trinidad and Tobago"],
    ["option_key" => "TN", "option_label" => "Tunisia"],
    ["option_key" => "TR", "option_label" => "Turkey"],
    ["option_key" => "TM", "option_label" => "Turkmenistan"],
    ["option_key" => "TC", "option_label" => "Turks and Caicos Islands (the)"],
    ["option_key" => "TV", "option_label" => "Tuvalu"],
    ["option_key" => "UG", "option_label" => "Uganda"],
    ["option_key" => "UA", "option_label" => "Ukraine"],
    ["option_key" => "AE", "option_label" => "United Arab Emirates (the)"],
    ["option_key" => "GB", "option_label" => "United Kingdom of Great Britain and Northern Ireland (the)"],
    ["option_key" => "UM", "option_label" => "United States Minor Outlying Islands (the)"],
    ["option_key" => "US", "option_label" => "United States of America (the)"],
    ["option_key" => "UY", "option_label" => "Uruguay"],
    ["option_key" => "UZ", "option_label" => "Uzbekistan"],
    ["option_key" => "VU", "option_label" => "Vanuatu"],
    ["option_key" => "VE", "option_label" => "Venezuela (Bolivarian Republic of)"],
    ["option_key" => "VN", "option_label" => "Viet Nam"],
    ["option_key" => "VG", "option_label" => "Virgin Islands (British)"],
    ["option_key" => "VI", "option_label" => "Virgin Islands (U.S.)"],
    ["option_key" => "WF", "option_label" => "Wallis and Futuna"],
    ["option_key" => "EH", "option_label" => "Western Sahara"],
    ["option_key" => "YE", "option_label" => "Yemen"],
    ["option_key" => "ZM", "option_label" => "Zambia"],
    ["option_key" => "ZW", "option_label" => "Zimbabwe"],
]);


