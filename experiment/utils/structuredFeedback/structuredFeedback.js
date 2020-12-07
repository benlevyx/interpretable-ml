/**
 * Created by kgajos on 1/7/17.
 */

function structuredFeedback() {

    var uiVersion = "a02";

    var cnt = 0;
    var dataURL = "structuredFeedback.php";
    var TEST_SETTING = "test";
    var PRODUCTION_SETTING = "production";
    var setting = PRODUCTION_SETTING;
    var structuredFeedbackDebug = 0;
    var MATERIALIZE = "materialize";
    var BOOTSTRAP = "bootstrap";
    var layoutMethod = BOOTSTRAP;
    var numExamplesToShow = 10;

    var context = "";

    var initialize = function(parentElementID, lm, maxNumberOfExamplesToShow) {
        layoutMethod = lm;
        numExamplesToShow = maxNumberOfExamplesToShow;
        createHTML(parentElementID);
        initializeUI();
        initializeData();
    };

    var createHTML = function(parentElementID) {
        var materializeTemplate = "    <div class='row materialize-container'>\
            <div class='col m4 card large' id='structured-items-offered' style='background-color: #53a3a3'>\
                <div class='card-content'  style='overflow-y: auto;'>\
                    <span style='color: white'><b>Some reasons mentioned by others:</b></span>\
                    <div class='items'></div>\
                </div>\
            </div>\
            <div class='col m8 card large' id='structured-items-selected'>\
                <div class='card-content' style='overflow-y: scroll;'>\
                    <b>Write your own reasons or borrow reasons mentioned by others. One reason per line, please.</b>\
                    <div class='input-field'>\
                        <input id='new-item' type='text'>\
                        <label for='new-item'>Your reason</label>\
                    </div>\
                    <div class='items'></div>\
                </div>\
            </div>\
        </div>";
        var bootstrapTemplate = "    <div class='container bootstrap-container' style='height: 500px'> \
            <div class='row' style='height: 100%'> \
                <div class='col-sm-4 card' id='structured-items-offered' style='background-color: #53a3a3; height: 100%'> \
                    <div class='card-body' style='overflow-y: auto; padding-left: 0px; padding-right: 0px;'> \
                        <span style='color: white'><b>Some reasons mentioned by others:</b></span> \
                        <div class='items'></div> \
                    </div> \
                </div> \
                <div class='col-sm-8 card' id='structured-items-selected' style='height: 100%'> \
                    <div class='card-body' style='overflow-y: scroll; padding-left: 0px; padding-right: 0px;'> \
                        <b>Write your own reasons or borrow reasons mentioned by others. One reason per line, please.</b> \
                        <input id='new-item' type='text' placeholder='Your reason' class='form-control' autofocus> \
                        <div class='items'></div> \
                    </div> \
                </div> \
            </div> \
        </div>";
        if (layoutMethod == BOOTSTRAP)
            $(parentElementID).html(bootstrapTemplate);
        else
            $(parentElementID).html(materializeTemplate);
    };

    var initializeUI = function() {
        $(".structured-item").on("dragstart", drag);
        $("#structured-items-offered").on("drop", drop).on("dragover", false);
        $("#structured-items-selected").on("drop", drop).on("dragover", false);
        $("#new-item").keypress(function(ev) {if (ev.keyCode == 13 || event.which == 13) {addNewItem($("#new-item").val()); $("#new-item").val("")}});
        // In case there are already some static items
        $(".delete-button").click(removeItem);
        $(".add-button").click(selectItem);

    };

    var initializeData = function() {
        var pid = ('undefined' === typeof participantID) ? -1 : participantID || -1;
        var sid = ('undefined' === sessionFlow) ? -1 : sessionFlow.sessionID;
        $.get(dataURL, {
            participantID: pid,
            sessionID: sid,
            setting: setting,
            context: context,
            uiVersion: uiVersion,
            requests: JSON.stringify([{action: "getExamples", n: numExamplesToShow}])
        }).done(function(data) {
            data = JSON.parse(data);
            for(var i=0; i<data.length; i++) {
                addOfferedItem(data[i].item, data[i].id);
            }
        });
    };

    /*
     * Add an item to the offered pane
     */
    var addOfferedItem = function(itemText, databaseID) {
        cnt++;
        var newID = 'structured-item-' + cnt;
        if (layoutMethod == BOOTSTRAP)
            $("#structured-items-offered").find(".items").prepend('<div class="structured-item item text-left" ' +
                'data-dbid="' + databaseID + '" draggable="true" ' +
                'id="' + newID + '" style="width: 100%">' + itemText +
                '<span class="delete-button btn-floating red float-right"><i class="material-icons">remove</i></span><span class="add-button btn-floating blue float-right"><i class="material-icons">add</i></span></div>');
        else
            $("#structured-items-offered").find(".items").prepend('<div class="structured-item card-panel" '
                + ' data-dbid="' + databaseID + '"'
                + ' draggable="true" id="'
                + newID + '">' + itemText
                + '<a class="delete-button btn-floating red right"><i class="material-icons">remove</i></a>'
                + '<a class="add-button btn-floating blue right"><i class="material-icons">add</i></a>'
                + '</div>');

        var el = $("#" + newID);
        el.on("dragstart", drag).find(".delete-button").click(removeItem);
        el.find(".add-button").click(selectItem);
        recordAction(el, "item-offered");
    };

    /*
     * called at the start of a drag operation
     */
    var drag = function(ev) {
        window.getSelection().removeAllRanges();
        ev.originalEvent.dataTransfer.setData("text", ev.target.id);
    };

    /*
     * called at the end of a drag operation
     */
    var drop = function(ev) {
        ev = ev.originalEvent;
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        var el = document.getElementById(data);
        var targetID = $(this).attr("id");
        // make sure that the item is being dropped onto a different pane than the one it is in right now
        if (!$(el).closest("#" + targetID).length) {
            var index = $(el).index() + 1;
            $(this).find(".items").prepend(el);
            //console.log(this);
            if ($(this).attr("id") == "structured-items-selected")
                recordAction(el, "add-offered-drag", index);
            else if ($(this).attr("id") == "structured-items-offered")
                recordAction(el, "remove-to-offered-drag", index);
        }
        return false;
    };

    /*
     * moves an item from the offered pane to the selected pane
     */
    var selectItem = function(ev) {
        var el = $(this).parent();
        var index = el.index() + 1;
        $("#structured-items-selected").find(".items").prepend(el);
        recordAction(el, "add-offered", index);
    };

    var recordAction = function(el, action, data_int) {
        var pid = ('undefined' === typeof participantID) ? -1 : participantID || -1;
        var sid = ('undefined' === sessionFlow) ? -1 : sessionFlow.sessionID;
        $dbid = $(el).attr("data-dbid");
        $.post(dataURL, {
            participantID: pid,
            sessionID: sid,
            setting: setting,
            context: context,
            uiVersion: uiVersion,
            requests: JSON.stringify([{action: action, dbid: $dbid, data_int: data_int}])})
    };

    /*
     * Add a new user-contributed item. Adds the item to the interface and sends it to the server to be recorded.
     */
    var addNewItem = function(itemText) {
        if (itemText) {
            cnt++;
            var newID = 'new-structured-item-' + cnt;
            if (layoutMethod == BOOTSTRAP)
                $("#structured-items-selected").find(".items").prepend('<div class="structured-item new-item text-left" ' +
                    'id="' + newID + '" style="width: 100%">' + itemText +
                    '<span class="delete-button btn-floating red float-right"><i class="material-icons">delete</i></span></div>');
            else

                $("#structured-items-selected").find(".items").prepend('<div class="structured-item new-item card-panel" id="'
                + newID + '">' + itemText
                + '<a class="delete-button btn-floating red right"><i class="material-icons">delete</i></a></div>');

            $("#" + newID).find(".delete-button").click(removeItem);

            // send the new item to the server, receive the database id, update the element in the DOM with the database id
            var pid = ('undefined' === typeof participantID) ? -1 : participantID || -1;
            var sid = ('undefined' === sessionFlow) ? -1 : sessionFlow.sessionID;
            $.get(dataURL, {
                    participantID: pid,
                    sessionID: sid,
                    setting: setting,
                    context: context,
                    uiVersion: uiVersion,
                    requests: JSON.stringify([{action: "addItem", itemText: itemText}])})
                .done(function(data) {
                    data = JSON.parse(data);
                    $("#" + newID).attr('data-dbid', data);
                });
        }
    };

    /*
     * Removes an item from the selected pane. Items that were created by the user get destroyed. Items that
     * came from the offered pane get returned to the offered pane.
     */
    var removeItem = function(ev) {
        var el = $(this).parent();
        var index = el.index() + 1;
        var newItem = el.hasClass("new-item");
        if (newItem) {
            el.remove();
            recordAction(el, "remove-permanently", index);
        } else {
            $("#structured-items-offered").find(".items").prepend(el);
            recordAction(el, "remove-to-offered", index);
        }
    };

    var getSelectedItemsDatabaseIDs = function() {
        return $("#structured-items-selected .structured-item").map(function(){return $(this).attr("data-dbid");}).get();
    };

    /*
     * Called when the data collection using this UI is finished and the result should be recorded
     */
    var finalize = function() {
        dbids = getSelectedItemsDatabaseIDs();
        var pid = ('undefined' === typeof participantID) ? -1 : participantID || -1;
        var sid = ('undefined' === sessionFlow) ? -1 : sessionFlow.sessionID;
        $.post(dataURL, {
                participantID: pid,
                sessionID: sid,
                setting: setting,
                context: context,
                uiVersion: uiVersion,
                requests: JSON.stringify([{action: "saveResult", items: dbids}])})
            .done(function(data) {
                if (structuredFeedbackDebug)
                    console.log("Done saving state");
            });
    };


    return {
        BOOTSTRAP: BOOTSTRAP,
        MATERIALIZE: MATERIALIZE,
        TEST_SETTING: TEST_SETTING,
        PRODUCTION_SETTING: PRODUCTION_SETTING,
        setting: setting,
        initialize: initialize,
        finalize: finalize
    }

}


