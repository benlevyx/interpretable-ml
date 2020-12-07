


var litwSurveys = {};

function litwSurvey(surveyCode) {

    // URL for sending survey results to
    var url = "survey.php";

    // if an object has been created for this survey already, return it from the cache
    if (surveyCode in litwSurveys)
        return litwSurveys[surveyCode];

    var itemValueChangeListeners = [];
    var pageChangeListeners = [];
    var surveyCompletionListeners = [];
    // these listeners will be called when the entire survey is completed *and* saved
    var surveySavedListeners = [];
    var formId = "form_" + surveyCode;
    var listenersInstalled = false;
    var self;

    var pagesByNumber = {};
    var pagesByCode = {};
    var currentPageNumber = 0;


    var installListeners = function() {
        $("#" + formId + " input, select, textarea").change(function() {respondToChange()});
        listenersInstalled = true;
    };

    var installFreeResponseListeners = function() {
        $(".has-free-response").each(function() {
            var self = this;
            if ("radio" == $(this).attr("type")) {
                var name = $(this).attr("name");
                $("#" + formId + " input[name=" + name + "]").change(function() {
                    adjustFreeResponseVisibility(self)
                });
            } else $(this).change(function() {
                adjustFreeResponseVisibility(self)
            });
            adjustFreeResponseVisibility(this);
        });
    };

    var adjustFreeResponseVisibility = function(el) {
        var free_response_element = $("#" + $(el).data("free_response_id"));
        if ($(el).is(':checked'))
            free_response_element.show();
        else
            free_response_element.hide();
    };

    var respondToChange = function() {
        itemValueChangeListeners.forEach(function(l) {l(self)});
    };

    var initializePages = function() {
        $("#" + formId + " .itemGroup_surveyPage").each(function() {
            pagesByNumber[$(this).data("page_number")] = this;
            pagesByCode[$(this).data("group_code")] = this;
        });
        $("#" + formId + " .page-submit-button").click(function() {
            showNextPage()
        });
        showNextPage();
    };

    /**
     *
     * @param page can be page number (indexed from 1), page code or a jQuery object for the page
     */
    var showPage = function(page) {
        if ("number" == typeof page)
            page = pagesByNumber[page]
        else if ("string" == typeof page)
            page = pagesByCode[page]
        $("#" + formId + " .itemGroup_surveyPage").hide();
        $(page).show();
        window.scrollTo(0, 0);
        currentPageNumber = $(page).data("page_number");
        pageChangeListeners.forEach(function (l) {l(currentPageNumber)});
    };

    var showNextPage = function() {
        var tempPageNumber = currentPageNumber + 1;
        while(tempPageNumber <= Object.keys(pagesByNumber).length) {
            if (pagesByNumber[tempPageNumber] && $(pagesByNumber[tempPageNumber]).data("page_included")) {
                showPage(tempPageNumber);
                return;
            }
            tempPageNumber++;
        }
        // if no next page to show was found, end the survey
        surveyEnded();
    };

    /**
     * Displays all pages in a single view -- used for debugging the content of the survey or printing it out
     */
    var showAllPages = function() {
        $("#" + formId + " .itemGroup_surveyPage").show();
    };

    var getNumPages = function() {
        return Object.keys(pagesByNumber).length;
    };

    var surveyEnded = function() {
        saveSurveyResults();
        surveyCompletionListeners.forEach(function(l) {l(self)});
    };

    var getItem = function(itemCode) {
        var res = $("#" + formId + " .surveyItem[data-item_code=" + itemCode + "]");
        if (!res.length)
            res = $("#" + formId + " .itemGroup[data-group_code=" + itemCode + "]");
        return res;
    };

    var getPage = function(pageCode) {
        return pagesByCode[pageCode];
    };

    /**
     * Get value of a survey item
     * @param itemCode
     */
    var value = function(itemCode) {
        var item = getItem(itemCode);
        return getSurveyItemValue(item).rawValue;
    };

    /**
     *
     * @param item a jQuery object for a survey item
     * @returns {{structuredValue, rawValue: *}}
     */
    var getSurveyItemValue = function(item) {
        var temp = {};
        var rawValue;
        if (item.hasClass("surveyItem-scale")) {
            temp.value_int = item.find("input[type=radio]:checked").val();
            rawValue = temp.value_int;
        } else if (item.hasClass("surveyItem-chooseOne")) {
            temp.value_text = item.find("input[type=radio]:checked").val();
            // if this item was not presented as radio buttons, see if we can find a select tag instead
            if ('undefined' === typeof temp.value_text)
                temp.value_text = item.find("select").val();
            rawValue = temp.value_text;
        } else if (item.hasClass("surveyItem-chooseOneInt")) {
            temp.value_int = item.find("input[type=radio]:checked").val();
            // if this item was not presented as radio buttons, see if we can find a select tag instead
            if ('undefined' === typeof temp.value_int) {
                temp.value_int = item.find("select").val();
                if ("" === temp.value_int)
                    temp.value_int = null;
            }
            rawValue = temp.value_int;
        } else if (item.hasClass("surveyItem-chooseMultiple")) {
            rawValue = [];
            item.find("input:checked.choose-multiple-value").each(function() {
                rawValue.push($(this).val());
            });
            temp.value_text = rawValue.join(", ");
        } else if (item.hasClass("surveyItem-text")) {
            temp.value_text = item.find("textarea").val();
            rawValue = temp.value_text;
        } else if (item.hasClass("surveyItem-number")) {
            temp.value_float = item.find("input").val();
            rawValue = temp.value_float;
        } else if (item.hasClass("surveyItem-longText")) {
            rawValue = item.find("textarea").val();
            temp.value_text = rawValue;
        }
        return {rawValue: rawValue, structuredValue: temp};
    };

    var freeResponseValue = function(itemCode, optionKey) {
        var freeResponseItem = $("#" + formId + " .free-response[name=" + itemCode + "_" + optionKey + "_free_response]");
        return freeResponseItem.val();
    };

    /**
     * Register a listener that will be called if value of any survey element changes
     * @param listener
     */
    var onChange = function(listener) {
        self = this;
        itemValueChangeListeners.push(listener);
        // run it immediately
        listener(this);
        if (!listenersInstalled)
            installListeners();
    };

    var onPageChange = function(listener) {
        pageChangeListeners.push(listener);
    };

    var onSurveyCompletion = function(listener) {
        surveyCompletionListeners.push(listener);
    };

    var onSurveySaved = function(listener) {
        surveySavedListeners.push(listener);
    };

    /**
     * Show item or items
     * @param itemCodes a single itemCode or an array of item codes; can include both item and page codes
     */
    var show = function(itemCodes) {
        if (!Array.isArray(itemCodes))
            itemCodes = [itemCodes];
        itemCodes.forEach(function(itemCode) {
            var item = getItem(itemCode);
            if (item.hasClass("itemGroup_surveyPage"))
                item.data("page_included", 1);
            else
                item.show();
        });
    };

    /**
     * Hide item or items
     * @param itemCodes a single itemCode or an array of item codes; can include both item and page codes
     */
    var hide = function(itemCodes) {
        if (!Array.isArray(itemCodes))
            itemCodes = [itemCodes];
        itemCodes.forEach(function(itemCode) {
            var item = getItem(itemCode);
            if (item.hasClass("itemGroup_surveyPage"))
                item.data("page_included", 0);
            else
                item.hide();
        });
    };

    /**
     * Shows item(s) if conditional is true; hides them otherwise
     * @param itemCodes a single itemCode or an array of item codes; can include both item and page codes
     * @param conditional something that can evaluate to true/false
     */
    var showIf = function(itemCodes, conditional) {
        if (conditional)
            show(itemCodes);
        else
            hide(itemCodes);
    };

    /**
     * Copy specific options to the top of a pull down menu to enable more efficient selection. If some options were copied
     * to the top previously, they will get replaced with the new ones.
     * @param itemCode survey itemCode to be updated
     * @param optionKeysToDuplicate options to be copied to the top of the menu
     * @returns {boolean} false if item does not exist, item is not rendered as a pull-down menu or if the user has
     * already selected a value; true otherwise
     */
    var setSplitMenuItems = function(itemCode, optionKeysToDuplicate) {
        var selectElement = getItem(itemCode).find("select");
        // if the survey item is not rendered using select or if the user has already selected a value, give up
        if (!selectElement.length || value(itemCode))
            return false;
        // remove existing split menu options
        $(selectElement).find(".split-menu-option").each(function() {
            $(this).remove()
        });
        var separator = document.createElement("option");
        $(separator).addClass("split-menu-option");
        $(separator).text("------------");
        $(separator).attr("disabled", "true");
        if (optionKeysToDuplicate)
            selectElement[0].insertBefore(separator, selectElement.find("option")[1]);
        for(var i=0; i<optionKeysToDuplicate.length; i++) {
            var existingOption = selectElement.find("option[value=" + optionKeysToDuplicate[i] + "]");
            if (existingOption.length) {
                var clone = existingOption[0].cloneNode(true);
                $(clone).addClass("split-menu-option");
                selectElement[0].insertBefore(clone, selectElement.find("option")[1]);
            }
        }
        return true;
    };

    var saveSurveyResults = function() {
        var participantId = $("#" + formId + " input[name=participant_id]").val();
        var sessionId = $("#" + formId + " input[name=session_id]").val();
        var surveyCode = $("#" + formId + " input[name=survey_code]").val();
        var surveyVersion = $("#" + formId + " input[name=survey_version]").val();

        var itemResponses = [];

        // select all survey items except for static items, which do not carry any values
        $("#" + formId + " .surveyItem:not(.surveyItem-static)").each(function() {
            var temp = getSurveyItemValue($(this)).structuredValue;

            // information common to all item types
            temp.instrument_code = $(this).data("instrument_code");
            temp.construct_code = $(this).data("construct_code");
            temp.item_code = $(this).data("item_code");
            temp.item_type = $(this).data("item_type");
            if ($(this).find(".surveyItem-extra.na").length)
                temp.na = $(this).find(".surveyItem-extra.na:checked").length;
            if ($(this).find(".surveyItem-extra.dont_understand").length)
                temp.dont_understand = $(this).find(".surveyItem-extra.dont_understand:checked").length;
            if ($(this).find(".surveyItem-extra.decline_to_answer").length)
                temp.decline_to_answer = $(this).find(".surveyItem-extra.decline_to_answer:checked").length;

            // capture free responses (if given)
            $(this).find(".free-response").each(function() {
                var temp2 = {instrument_code: temp.instrument_code, construct_code: temp.construct_code};
                temp2.item_code = $(this).attr("name");
                temp2.value_text = $(this).val();
                temp2.item_type = temp.item_type + "_freeResponse";
                itemResponses.push(temp2);
            });
            if ($(this).hasClass("surveyItem-chooseMultiple")) {
                $(this).find(".choose-multiple-value").each(function() {
                    var temp2 = {instrument_code: temp.instrument_code, construct_code: temp.construct_code};
                    temp2.item_code = $(this).attr("name");
                    temp2.item_type = "chooseMultiple_option";
                    temp2.value_int = $(this).is(':checked') ? 1 : 0;
                    itemResponses.push(temp2);
                });
            }

            itemResponses.push(temp);
        });

        var itemResponsesJSON = JSON.stringify(itemResponses);

        $.post(url, {
            items: itemResponsesJSON,
            participant_id: participantId,
            session_id: sessionId,
            survey_code: surveyCode,
            survey_version: surveyVersion
        }).done(function(data) {
            surveySavedListeners.forEach(function(l) {l(data)});
        }).fail(function(data) {
            console.log("Problem saving survey data for survey " + surveyCode + ": " + data);
        });
    };

    installFreeResponseListeners();
    initializePages();

    var res = {
        onChange: onChange,
        onPageChange: onPageChange,
        onSurveyCompletion: onSurveyCompletion,
        onSurveySaved: onSurveySaved,
        value: value,
        freeResponseValue: freeResponseValue,
        show: show,
        showIf: showIf,
        hide: hide,
        setSplitMenuItems: setSplitMenuItems,
        showNextPage: showNextPage,
        showAllPages: showAllPages,
        getNumPages: getNumPages
    };

    // cache this object
    litwSurveys[surveyCode] = res;

    return res;
}