


function processSurveyResults(surveyFormId) {
    var participantId = $("#" + surveyFormId + " input[name=participant_id]").val();
    var sessionId = $("#" + surveyFormId + " input[name=session_id]").val();
    var surveyCode = $("#" + surveyFormId + " input[name=survey_code]").val();
    var surveyVersion = $("#" + surveyFormId + " input[name=survey_version]").val();

    var itemResponses = [];

    // select all survey items except for static items, which do not carry any values
    $("#" + surveyFormId + " .surveyItem:not(.surveyItem-static)").each(function() {
        var temp = {
            instrument_code: $(this).data("instrument_code"),
            construct_code: $(this).data("construct_code"),
            item_code: $(this).data("item_code"),
        };
        if ($(this).find(".surveyItem-extra.na").length)
            temp.na = $(this).find(".surveyItem-extra.na:checked").length;
        if ($(this).find(".surveyItem-extra.dont_understand").length)
            temp.dont_understand = $(this).find(".surveyItem-extra.dont_understand:checked").length;
        if ($(this).find(".surveyItem-extra.decline_to_answer").length)
            temp.decline_to_answer = $(this).find(".surveyItem-extra.decline_to_answer:checked").length;

        if ($(this).hasClass("surveyItem-scale"))
            temp.value_int = $(this).find("input[type=radio]:checked").val();
        else if ($(this).hasClass("surveyItem-text"))
            temp.value_text = $(this).find("textarea").val();

        itemResponses.push(temp);
    });

    var itemResponsesJSON = JSON.stringify(itemResponses);

    $.post("survey.php", {
        items: itemResponsesJSON,
        participant_id: participantId,
        session_id: sessionId,
        survey_code: surveyCode,
        survey_version: surveyVersion
    }).done(function(data) {
    }).fail(function(data) {
        console.log("Problem saving survey data for survey " + surveyCode);
    });
}