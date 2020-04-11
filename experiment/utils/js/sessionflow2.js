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

    /*
     * Initiates session by making an AJAX call to the server to get the session ID.
     *
     * @callback -- this function will be called with session id once the session is
     * initialized and session id has been obtained
     */
    initiateSession: function(callback) {
        // install the listener
        this.onSetSessionID(callback);
        self = this;
        // if sessionID is already set correctly, no need to make the AJAX call
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
    },

    /*
     * Sets sessionID.  Used when the sessionID is obtained via PHP on server -- removes the need to make the initial
     * AJAX call
     */
    setSessionID: function(sessionID) {
        this.sessionID = sessionID;
        this.sessionIDObtained();
    },

    /*
     * Internal method -- called when the sessionID has been set.  Unlocks the ability to transmit session events
     * back to the server.
     */
    sessionIDObtained: function() {
        // for any activities that got recorded so far, make sure that they have an up-to-date session number
        for (var i=0; i<this.activityQueue.length; i++)
            this.activityQueue[i].sessionID = this.sessionID;
        if (this.activityQueue.length)
            this.sendData(this);
        // for any form elements that are supposed to hold session_id, set the value
        $("input[name='session_id']").val(this.sessionID);
        this.notifyOnSessionIDListeners(this);
    },

    sessionIDNotObtained: function(data) {
        console.log("Failed to obtain session ID: " + data);
        // try again in a bit
        var self = this;
        setTimeout(function() {self.initiateSession()}, 10000);
    },

    /*
     * Used to add listeners that will be notified once the sessionID is set
     */
    onSetSessionID: function(listener) {
        if (this.sessionID)
            listener.call(this, this.sessionID);
        else
            this.sessionIDlisteners.push(listener);
    },

    /*
     * Internal method: called when session ID has been obtained to notify any listeners who might need this information
     */
    notifyOnSessionIDListeners: function(self) {
        for(var i=0; i<self.sessionIDlisteners.length; i++)
            self.sessionIDlisteners[i].call(self, self.sessionID);
    },

    /*
     * This method needs to be called once the participantID has been obtained.  It links the sessionID to the participantID.
     */
    setParticipantID: function(participantID) {
        this.recordData({
            action: "setParticipantID",
            sessionID: this.sessionID,
            participantID: participantID
        });
    },

    /*
     * Internal method used to record the loading of the page and the referrer info
     */
    recordLanding: function() {
        var referrer = document.referrer;
        var internal = referrer.includes("labinthewild.org");
        if (internal) {
            var referringParticipantID = getQueryVariable("rpid", null);
            if (!referringParticipantID && typeof _POST !== "undefined")
                referringParticipantID = _POST.rpid;
            this.recordActivity("landing-internal", referrer, QueryString.rpid);
        } else
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

    /*
     * Internal method: adds a packet of data representing a single session event to the queue of activities to be
     * sent to the server; attempts to initiate sending of data
     */
    recordData: function(data) {
        data.clientStartTime = new Date().getTime();
        this.activityQueue.push(data);
        this.sendData(this);
    },

    /*
     * Internal method: manages sending of the data; ensures that there is only one send connection open at a time;
     * sends all the data that have accumulated since the last successful send; if the send is unsuccessful,
     * it automatically tries it again
     */
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

    /*
     * Internal method: handles a click on any of the DOM nodes of class "sessionFlow"
     */
    eventHandler: function(event) {
        sessionFlow.recordActivity(null, this.id);
    },

    handlePageUnload: function(event) {
        sessionFlow.recordActivity(null, "page_unload");
    },

    handleVisibilityChange: function(event) {
        if (document.hidden) {
            sessionFlow.recordActivity(null, "page_not_visible");
        } else  {
            sessionFlow.recordActivity(null, "page_visible");
        }
    },

    handleWindowFocus: function(event) {
        sessionFlow.recordActivity(null, "window_in_focus");
    },

    handleWindowBlur: function(event) {
        sessionFlow.recordActivity(null, "window_not_in_focus");
    },

    // This method is called automatically at the beginning, but can be called again manually if the DOM has changed and
    // new DOM elements need to be watched; it instruments all objects of class "sessionFlow" -- clicking on any
    // of them will automatically result in an activity being recorded
    installListeners: function() {
        // just in case we have already installed the event handler, we are going to try to remove it from the list of listeners
        // and then add it -- this ensures that even if installListeners() is called more than once, we will only have one
        // instance of the eventHandler attached to any one DOM element at a time
        $(".sessionFlow").off("click", sessionFlow.eventHandler).click(sessionFlow.eventHandler);
        // record page unload events; again, make sure that we are subscribed to this event only once
        $(window).off("unload", sessionFlow.handlePageUnload).on("unload", sessionFlow.handlePageUnload);
        $(window).off("focus", sessionFlow.handleWindowFocus).on("focus", sessionFlow.handleWindowFocus);
        $(window).off("blur", sessionFlow.handleWindowBlur).on("blur", sessionFlow.handleWindowBlur);
        // capture visibility change events (when the person switches away from or back to this browser window/tab
        $(document).off("visibilitychange", sessionFlow.handleVisibilityChange).on("visibilitychange", sessionFlow.handleVisibilityChange);
    }
};

$(function() {
    sessionFlow.installListeners();
    sessionFlow.recordLanding();
});