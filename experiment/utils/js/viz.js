/**
 * Created by kgajos on 11/19/17.
 */

var vizScriptURL = document.currentScript.src;

function lineViz(nodeID) {

    var mediaDirectoryURL = vizScriptURL.substring(0, vizScriptURL.length - 6) + "../media/";
    var bottomV = 0;
    var topV = .5;

    var leftLabel = function(name) {
        if (name)
            $(nodeID + " .lineViz-left_label").html(name);
        else
            return $(nodeID + " .lineViz-left_label").html();
        return this;
    };

    var rightLabel = function(name) {
        if (name)
            $(nodeID + " .lineViz-right_label").html(name);
        else
            return $(nodeID + " .lineViz-right_label").html();
        return this;
    };

    var bottomLabel = function(name) {
        if (name)
            $(nodeID + " .lineViz-bottom_label").html(name);
        else
            return $(nodeID + " .lineViz-bottom_label").html();
        return this;
    };

    var bottomValue = function(val) {
        bottomV = Math.min(Math.max(0, val), 1);
        $(nodeID + " .lineViz-bottom_pointer_offset").width(93 * bottomV + "%");
        $(nodeID + " .lineViz-bottom_label_offset").width(7.125 + 58.75 * bottomV + "%");
        return this;
    };

    var topValue = function(val) {
        topV = Math.min(Math.max(0, val), 1);
        $(nodeID + " .lineViz-top_pointer_offset").width(93 * topV + "%");
        $(nodeID + " .lineViz-top_label_offset").width(7.125 + 58.75 * topV + "%");
        return this;
    };

    $(nodeID).html(
        '    <div style="width: 100%; display: block">' +
        '        <div class="lineViz-top_label_offset" style="display: inline-block"></div>' +
        '        <div class="text-center" style="width: 25%; display: inline-block">Average</div>' +
        '        <div style="width: 100%; display: block">' +
        '            <div class="lineViz-left_label" style="width: 17.5%; text-align: right; display: inline-block"></div>' +
        '            <div style="width: 63%; display: inline-block; line-height: 1px">' +
        '                <div class="lineViz-top_pointer_offset" style="display: inline-block"></div>' +
        '                <img src="' + mediaDirectoryURL + 'triangle-orange-down.png" width="5%"/>' +
        '                <br/>' +
        '                <div style="width: 2.5%; display: inline-block;"></div>' +
        '                <div style="background: black; width: 93%; height: 1px; display: inline-block;"></div>' +
        '                <div style="width: 2.5%; display: inline-block;"></div>' +
        '                <br/>' +
        '                <div class="lineViz-bottom_pointer_offset" style="display: inline-block"></div>' +
        '                <img src="' + mediaDirectoryURL + 'triangle-green-up.png" width="5%"/>' +
        '            </div>' +
        '            <div class="lineViz-right_label" style="width: 17.5%; display: inline-block"></div>' +
        '        </div>' +
        '        <div class="lineViz-bottom_label_offset" style="display: inline-block"></div>' +
        '        <div class="text-center lineViz-bottom_label" style="width: 25%; display: inline-block">You</div>' +
        '    </div>');

    topValue(topV);
    bottomValue(bottomV);

    return {
        leftLabel: leftLabel,
        rightLabel: rightLabel,
        bottomLabel: bottomLabel,
        bottomValue: bottomValue,
        topValue: topValue
    }

}