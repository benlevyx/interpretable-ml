/**
 * Created by kgajos on 11/10/15.
 */


var sessionFlow = {

    debug: 0,
    sessionID: null,
    activityNumber: 0,
    // queue of activities to be sent to the mother ship
    activityQueue: [],
    // set to true if an ajax call to the mother ship is currently in progress
    busy: 0,
    // has at least one activity been recorded already?
    firstActivityRecorded: false,
    currentActivityStage: null,

    // listeners that want to be called once the sessionID is set
    sessionIDlisteners: [],

    initiateSession: function() {
        self = this;
        if (this.sessionID && Number.isInteger(this.sessionID) && this.sessionID > 0)
            this.sessionIDObtained();
        else
            $.ajax({
                url: "sessionflow.php",
                type: "POST",
                data: {requests: JSON.stringify([{action: "start", clientStartTime: new Date().getTime()}])},
                success: function( data ) {
                    var tempID = parseInt(data.trim());
                    if (Number.isInteger(tempID)) {
                        self.sessionID = tempID;
                        self.sessionIDObtained();
                    } else
                        self.sessionIDNotObtained(data);
                },
                error: function(data) {
                    self.sessionIDNotObtained(data);
                }
            });
        this.recordLanding();
    },

    sessionIDObtained: function() {
        // for any activities that got recorded so far, make sure that they have an up-to-date session number
        for (var i=0; i<this.activityQueue.length; i++)
            this.activityQueue[i].sessionID = this.sessionID;
        if (this.activityQueue.length)
            this.sendData(this);
        this.notifyOnSessionIDListeners(this);
    },

    sessionIDNotObtained: function(data) {
        console.log("Failed to obtain session ID: " + data);
        // try again in a bit
        var self = this;
        setTimeout(function() {self.initiateSession()}, 10000);
    },

    /*
     Used to add listeners that will be notified once the sessionID is seet
     */
    onSetSessionID: function(listener) {
        if (this.sessionID)
            listener.call(this, this.sessionID);
        else
            this.sessionIDlisteners.push(listener);
    },

    notifyOnSessionIDListeners: function(self) {
        for(var i=0; i<self.sessionIDlisteners.length; i++)
            self.sessionIDlisteners[i].call(self, self.sessionID);
    },

    setParticipantID: function(participantID) {
        this.recordData({
            action: "setParticipantID",
            sessionID: this.sessionID,
            participantID: participantID
        });
    },

    recordLanding: function() {
        var referrer = document.referrer;
        var internal = referrer.includes("labinthewild.org");
        if (internal)
            this.recordActivity("landing-internal", referrer, QueryString.pid);
        else
            this.recordActivity("landing-external", referrer);
    },

    recordActivity: function(activityStage, activityCode, activityData) {
        activityStage = activityStage || this.currentActivityStage;
        this.currentActivityStage = activityStage;
        this.activityNumber++;
        var data = {
            action: "recordActivity",
            sessionID: this.sessionID,
            activityStage: activityStage,
            activityCode: activityCode,
            activityNumber: this.activityNumber,
            activityData: activityData || "",
        };
        if (!this.firstActivityRecorded)
            data.firstActivity = true;
        this.firstActivityRecorded = true;
        this.recordData(data);
    },

    recordData: function(data) {
        data.clientStartTime = new Date().getTime();
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
                url: "sessionflow.php",
                type: "POST",
                data: {requests: JSON.stringify(data)},
                success: function( response ) {
                    if (self.debug) {
                        console.log("Session flow update sent: " + (data ? JSON.stringify(data) : " [[nada]]"));
                        console.log("Response: " + response);
                    } self.busy = false;
                    self.sendData(self);
                },
                error: function() {
                    console.log("Failed to transmit session flow update:" + (data ? JSON.stringify(data) : " [[nada]]"));
                    self.busy = false;
                    self.sendData(self, data);
                }
            });
        else
            self.busy = false;
    },

    // instrument all objects of class "sessionFlow" -- clicking on any of them will automatically result
    // in an activity being recorded
    installListeners: function() {
        $(".sessionFlow").click(function(event) {
            sessionFlow.recordActivity(null, this.id);
        });
    }
};

sessionFlow.initiateSession();

$(function() {
    sessionFlow.installListeners();
});