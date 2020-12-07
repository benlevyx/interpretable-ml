/**
 * Created by kgajos on 11/13/15.
 */

/*
Assumes:
sessionflow.js
jquery
 */


var adaptInTheWild = {

    debug: 0,

    // sessionID as defined by sessionflow.js
    sessionID: null,

    measurements: {},

    // queue of activities to be sent to the mother ship
    activityQueue: [],
    // set to true if an ajax call to the mother ship is currently in progress
    busy: 0,


    initialize: function() {
        var self = this;
        if (sessionFlow) {
            sessionFlow.onSetSessionID(function(sessionID) {self.sessionID = sessionID; self.sendData(self)});
        } else console.log("adaptInTheWild Error: no sessionFlow object present");
    },

    /*
    selects a one of many possible content options
    variantID uniquely identifies the choice point
    variants should be an array of
    {key: "short key identifying this variant", content: "html content to be placed"} objects
     */
    chooseVariant: function(variantID, variants, strategy) {
        if (variants.length == 0)
            return "";
        // for now pick a variant at random with equal probability
        variant = variants[Math.floor(variants.length * Math.random())];
        this.recordVariantChoice(variantID, variant.key);
        return variant.content;
    },

    chooseVariantThompson: function(variantID, variants, oecEvaluator, minOEC, maxOEC) {
        var maxVal = 0;
        var bestVariant = null;
        for(var i=0; i<variants.length; i++) {
            var curVariant = variants[i];
            var evaluation = oecEvaluator(curVariant);
            var curN = evaluation.N;
            var curOEC = evaluation.OEC;
            var alpha = 1 + curN * (curOEC - minOEC) / (maxOEC - minOEC);
            var beta = 1 + curN * (1 - (curOEC - minOEC) / (maxOEC - minOEC));
            var betaSample = null; // TODO
            if (betaSample > maxVal) {
                maxVal = betaSample;
                bestVariant = curVariant;
            }
        }
        return bestVariant.content;
    },

    /*
    Selects one of several content options (encoded in variants) and applies it to the DOM element(s)
    specified by the selector
     */
    applyVariant: function(selector, variantID, variants, strategy) {
        if (this.debug) console.log(variants);
        $(selector).html(this.chooseVariant(variantID, variants,strategy));
    },

    /*
    Internal method that causes a particular run-time choice to be reported back to the mothership
     */
    recordVariantChoice: function(variantID, variantChoiceKey) {
        if (this.debug) console.log("Choosing " + variantChoiceKey + " for " + variantID);
        // send data to the mothership
        this.recordData({action: "variantChoice", variantID: variantID, variantChoiceKey: variantChoiceKey});
    },

    recordMeasurement: function(measurementID, measurementValue) {
        if (measurementValue)
            this.measurements[measurementID] = measurementValue;
        else if (this.measurements[measurementID])
            this.measurements[measurementID]++;
        else
            this.measurements[measurementID] = 1;
        if (this.debug) console.log("Measurement " + measurementID + " = " + this.measurements[measurementID]);
        // send data to the mothership
        this.recordData({
            action: "measurement",
            measurementID: measurementID,
            measurementValue: this.measurements[measurementID]
        });
    },

    recordData: function(data) {
        data.clientTime = new Date().getTime();
        this.activityQueue.push(data);
        this.sendData(this);
    },

    sendData: function(self, data) {
        if (!self)
            self = this;
        // do not attempt to send if we are currently sending or if we haven't obtained sessionID yet
        if (self.busy || !self.sessionID)
            return;
        self.busy = true;

        data = data || [];
        data = data.concat(self.activityQueue);
        self.activityQueue = [];

        if (data.length > 0)
            $.ajax({
                url: "adaptinthewild.php",
                type: "POST",
                data: {requests: JSON.stringify(data), sessionID: self.sessionID},
                success: function( data ) {
                    if (self.debug)
                        console.log("AdaptintheWild update sent: " + (data ? JSON.stringify(data) : " [[nada]]"));
                    self.busy = false;
                    self.sendData(self);
                },
                error: function() {
                    console.log("Failed to transmit adaptintheWild update:" + (data ? JSON.stringify(data) : " [[nada]]"));
                    self.busy = false;
                    self.sendData(data);
                }
            });
        else
            self.busy = false;
    }
};

// instrument all objects of class "measurement" -- clicking on any of them will automatically result
// in an activity being recorded
$(function() {
    $(".measurement").click(function(event) {
        adaptInTheWild.recordMeasurement(this.id);
    });
    adaptInTheWild.initialize();
});