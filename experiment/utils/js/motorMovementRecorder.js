/**
 * Created by kgajos on 6/10/16.
 *
 * Tools for recording trajectories of pointer movements.
 *
 * Requires jQuery.
 *
 */


function motorMovementRecorder() {

    var debug = 0;

    var validTargetSelectors = [];

    // last known mouse position
    var lastMousePosition = {x: null, y: null};

    var recordingEvents = false;

    var curMovementRecord = null;

    var lastMovementRecord = null;
    var lastMovementRecordEndTime = null;

    // if a mouse is currently over one of the registered targets, this variable will hold its ID
    var curTargetID = null;

    // keeps track of whether the mouse pointer is in or out
    var mouseIn = true;

    /**
     * Automatically called when this module is created.  Installs all the necessary event listeners.
     */
    var initialize = function() {
        // mouse button events
        $(document).on("click", function(event) {handlePointingEvent(event, "click")});
        $(document).on("mousedown", function(event) {handlePointingEvent(event, "mousedown")});
        $(document).on("mouseup", function(event) {handlePointingEvent(event, "mouseup")});

        // mouse move
        $(document).mousemove(function(event) {handleMouseMoveEvent(event)});

        // touch events
        $(document).on("touchstart", function(event) {handlePointingEvent(event, "touchstart")});
        $(document).on("touchend", function(event) {handlePointingEvent(event, "touchend")});
        $(document).on("touchmove", function(event) {handlePointingEvent(event, "touchmove")});
        $(document).on("touchcancel", function(event) {handlePointingEvent(event, "touchcancel")});

        // catching mouse leaving/entering the browser window
        addEvent(document, "mouseout", handleMouseOutEvent);
        addEvent(document, "mouseover", handleMouseOverEvent);
        // capture scroll events
        $( window ).scroll(function() {handleInterruptionEvent(null, event, "scroll")})
        document.addEventListener("visibilitychange", handleVisibilityChange, false);
    };

    /**
     * Registers the valid targets for the current movement; clicks anywhere outside the valid targets will be treated as errors.
     *
     * @param targetSelectors -- an array of CSS selectors describing valid targets; motorRecorder will treat clicks
     * on those targets as valid clicks; clicks outside of valid targets will be counted as errors
     */
    var setValidTargets = function(targetSelectors) {
        validTargetSelectors = targetSelectors || [];
        //$(validTargetSelectors.join(", ")).mouseenter(handleTargetEnter).mouseleave(handleTargetLeave);
        return this;
    };

    /**
     * create a new MotorMovementRecord and start recording all pointer-related events
     *
     * @param additionalMetaData -- data contained in this object will be added to the first "start" event in the MotorMovementRecord
     * @returns this
     */
    var startMovementRecord = function(additionalMetaData) {
        recordingEvents = true;
        curMovementRecord = new MotorMovementRecord(new Date().getTime(), lastMousePosition.x, lastMousePosition.y, additionalMetaData);
        return this;
    };

    /**
     * Finishes the MotorMovementRecord and returns it.
     *
     * @param x
     * @param y
     * @param time
     * @param additionalMetaData
     * @returns the completed MotorMovementRecord if one was being recorded, null otherwise
     */
    var completeMovementRecord = function(x, y, time, additionalMetaData) {
        time = time || new Date().getTime();
        x = x || lastMousePosition.x;
        y = y || lastMousePosition.y;
        if (recordingEvents) {
            recordingEvents = false;
            if (curTargetID) {
                //get target position relative to the browser window
                var curTargetClientPosition = $("#" + curTargetID).get(0).getBoundingClientRect();
                var curTargetSize = {width: $("#" + curTargetID).outerWidth(), height: $("#" + curTargetID).outerHeight()};
                curMovementRecord.setTarget(curTargetClientPosition.left, curTargetClientPosition.top, curTargetSize.width, curTargetSize.height, curTargetID);
            }
            curMovementRecord.endMovement(x, y, time, curTargetID != null, $.extend(additionalMetaData, (curTargetID ? {targetID: curTargetID} : {})));
            curMovementRecord.computeStats();
            lastMovementRecord = curMovementRecord;
            lastMovementRecordEndTime = time;
            if (debug) console.log(curMovementRecord);
            return curMovementRecord;
        }
        return null;
    };

    /**
     * Stop recording, destroy any MotorMovementRecord that was being recorded
     *
     * @returns {abandonMovementRecord}
     */
    var abandonMovementRecord = function() {
        recordingEvents = false;
        return this;
    };

    var handleMouseMoveEvent = function(event) {
        var time = new Date().getTime();
        event = event || window.event;
        lastMousePosition.x = event.clientX;
        lastMousePosition.y = event.clientY;
        if (debug >= 2) console.log(lastMousePosition);

        // check if we are over one of the registered targets
        var closestTargetID = $(event.target).closest(validTargetSelectors.join(", ")).attr('id') || null;
        if (debug && closestTargetID != curTargetID) console.log("inside target with ID: " + closestTargetID);
        if (debug >= 2 && closestTargetID != curTargetID && closestTargetID) {
            console.log($("#" + closestTargetID).get(0).getBoundingClientRect());
            console.log({width: $("#" + closestTargetID).outerWidth(), height: $("#" + closestTargetID).outerHeight()});
        }
        curTargetID = closestTargetID;

        // record event
        if (recordingEvents) {
            curMovementRecord.addMovementPoint(event.clientX, event.clientY, time, curTargetID != null, (curTargetID ? {targetID: curTargetID} : {}));
        }
    };

    var handlePointingEvent = function(event, type) {
        var time = new Date().getTime();
        event = event || window.event;
        lastMousePosition.x = event.clientX;
        lastMousePosition.y = event.clientY;

        if (debug && type == "click")
            console.log("click");

        // sometimes we can get a click event just after we had closed an event; we should add it to the previous record
        if (lastMovementRecord && lastMovementRecordEndTime - time <= 10
            && type == "click"
            && event.clientX == lastMovementRecord.endX
            && event.clientY == lastMovementRecord.endY)
            lastMovementRecord.addEvent(type, event.clientX, event.clientY, time, curTargetID != null,
                (curTargetID ? {targetID: curTargetID} : {}));
        else if (recordingEvents) {
            curMovementRecord.addEvent(type, event.clientX, event.clientY, time, curTargetID != null,
                (curTargetID ? {targetID: curTargetID} : {}));
        }
    };

    var handleInterruptionEvent = function(time, event, type) {
        time = time || new Date().getTime();
        event = event || window.event;

        if (recordingEvents) {
            curMovementRecord.addInterruptionEvent(type, event.clientX, event.clientY, time, curTargetID != null,
                (curTargetID ? {targetID: curTargetID} : {}));
            if (debug) console.log(type);
        }
    };

    var handleMouseOutEvent = function(event) {
        var time = new Date().getTime();
        event = event || window.event;
        lastMousePosition.x = event.clientX;
        lastMousePosition.y = event.clientY;
        var from = event.relatedTarget || event.toElement;

        if (mouseIn && (!from || from.nodeName == "HTML")) {
            mouseIn = false;
            if (debug > 1) console.log(event);
            handleInterruptionEvent(time, event, "mouseleave");
        }
    };

    var handleMouseOverEvent = function(event) {
        var time = new Date().getTime();
        event = event || window.event;

        if (!mouseIn) {
            mouseIn = true;
            handleInterruptionEvent(time, event, "mouseenter");
        }
    };

    var handleVisibilityChange = function(event) {
        var time = new Date().getTime();
        if (document.hidden) {
            handleInterruptionEvent(time, event, "pagehidden");
        } else  {
            handleInterruptionEvent(time, event, "pagevisible");
        }
    };


    var addEvent = function(obj, evt, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(evt, fn, false);
        }
        else if (obj.attachEvent) {
            obj.attachEvent("on" + evt, fn);
        }
    };

    // automatically initialize the recorder
    initialize();

    // public methods and variables
    return {
        setValidTargets: setValidTargets,
        startMovementRecord: startMovementRecord,
        completeMovementRecord: completeMovementRecord,
        abandonMovementRecord: abandonMovementRecord,
        isRecording: function() {return recordingEvents}
    }
}

function MotorMovementRecord(startTime, startX, startY, additionalMetaData) {
    this.startTime = startTime;
    this.startX = startX;
    this.startY = startY;
    this.endX = null;
    this.endY = null;
    this.nominalDistance = null;
    this.actualDistance = null;
    this.distanceFromTargetCenter = null;
    this.targetLeft = null;
    this.targetTop = null;
    this.targetCenterX = null;
    this.targetCenterY = null;
    this.targetWidth = null;
    this.targetHeight = null;
    this.targetDescriptor = "";
    this.missCount = 0;
    this.includesDiscontinuities = false;
    this.events = [];
    this.movementTime = null;
    this.addEvent("start", startX, startY, startTime, null, additionalMetaData);
}

/**
 *
 * @param x
 * @param y
 * @param time
 * @param insideTarget
 * @param additionalMetaData -- an object with any additional meta data you want to include with the event
 */
MotorMovementRecord.prototype.addMovementPoint = function(x, y, time, insideTarget, additionalMetaData) {
    var eventData = $.extend({type: "m", x: x, y: y, time: time, in: (insideTarget ? 1 : 0)}, additionalMetaData);
    this.events.push(eventData);
    // if we didn't have an x,y position when the movement start was declared, the first recorded movement point will serve as the starting point
    if (this.startX == null) {
        this.startX = x;
        this.startY = y;
    }
    return this;
};

MotorMovementRecord.prototype.addInterruptionEvent = function(type, x, y, time, insideTarget, additionalMetaData) {
    this.includesDiscontinuities = true;
    this.addEvent(type, x, y, time, insideTarget, additionalMetaData);
};

MotorMovementRecord.prototype.addEvent = function(type, x, y, time, insideTarget, additionalMetaData) {
    var eventData = $.extend({type: type, x: x, y: y, time: time, in: (insideTarget ? 1 : 0)}, additionalMetaData);
    this.events.push(eventData);
    if (type == "click" && !insideTarget)
        this.missCount++;
    return this;
};

MotorMovementRecord.prototype.endMovement = function(x, y, time, insideTarget, additionalMetaData) {
    this.endX = x || this.events[this.events.length-1].x;
    this.endY = y || this.events[this.events.length-1].y;
    time = time || this.events[this.events.length-1].time;
    this.addEvent("end", this.endX, this.endY, time, insideTarget, additionalMetaData);
    this.movementTime = time - this.startTime;
    this.actualDistance = getDistance(this.startX, this.startY, this.endX, this.endY);
    if (this.targetCenterX != null)
        this.distanceFromTargetCenter = getDistance(this.endX, this.endY, this.targetCenterX, this.targetCenterY);
    return this;
};

MotorMovementRecord.prototype.setTarget = function(targetLeft, targetTop, targetWidth, targetHeight, targetDescriptor) {
    this.targetLeft = targetLeft;
    this.targetTop = targetTop;
    this.targetWidth = targetWidth;
    this.targetHeight = targetHeight;
    this.targetCenterX = this.targetLeft + 0.5 * this.targetWidth;
    this.targetCenterY = this.targetTop + 0.5 * this.targetHeight;
    this.targetDescriptor = targetDescriptor;
    this.nominalDistance = getDistance(this.targetCenterX, this.targetCenterY, this.startX, this.startY);
    return this;
};

// once trial is over, computes basic statistics for the trial
MotorMovementRecord.prototype.computeStats = function() {

    return this;
};

/**
 * Translates coordinates of events by the specified offset;  modifies the events array that it gets as input
 *
 * @param events
 * @param offsetX
 * @param offsetY
 * @returns {*}
 */
MotorMovementRecord.prototype.translateEvents = function(events, offsetX, offsetY) {
    for (var i=0; i<events.length; i++) {
        events[i].x += offsetX;
        events[i].y += offsetY;
    }
    return events;
};

/**
 * Rotates coordinates of events by the specified offset; modifies the events array that it gets as input
 *
 * @param events
 * @param angle
 * @returns {*}
 */
MotorMovementRecord.prototype.rotateEvents = function(events, angle) {
    for (var i=0; i<events.length; i++) {
        var oldX = events[i].x;
        var oldY = events[i].y;
        events[i].x = oldX * Math.cos(angle) - oldY * Math.sin(angle);
        events[i].y = oldX * Math.sin(angle) + oldY * Math.cos(angle);
    }
    return events;
};

/**
 * Returns a clone of the events array
 *
 * @param eventTypesToInclude -- an optional array listing the event types to include in the clone; if this is not provided,
 * all events will be cloned
 * @returns {Array}
 */
MotorMovementRecord.prototype.cloneEvents = function(eventTypesToInclude) {
    var res = [];
    for (var i=0; i<this.events.length; i++) {
        if (!eventTypesToInclude || _.contains(eventTypesToInclude, this.events[i].type)) {
            res.push({});
            for (var prop in this.events[i]) {
                res[res.length-1][prop] = this.events[i][prop];
            }
        }
    }
    return res;
};

/**
 * returns a clone of the events translated and rotated such that they align with the task axis
 * @param eventTypesToInclude
 * @returns {Array}
 */
MotorMovementRecord.prototype.getEventsAlignedWithTaskAxis = function(eventTypesToInclude) {
    var evs = this.cloneEvents(eventTypesToInclude);
    evs = this.translateEvents(evs, -this.startX, -this.startY);
    evs = this.rotateEvents(evs, -Math.atan((this.endY - this.startY)/(this.endX - this.startX)));
    return evs;
};


/**
 * Computes the length of the actual path traced by the pointer; saves it as a property of the movement record object
 * Returns this
 */
MotorMovementRecord.prototype.computePathLength = function() {
    this.pathLength = getDistance(this.startX, this.startY, this.events[0].x, this.events[0].y);
    for (var i=1; i<this.events.length; i++) {
        this.pathLength += getDistance(this.events[i-1].x, this.events[i-1].y, this.events[i].x, this.events[i].y);
    }
    return this;
};

/**
 * Computes how much the movement strayed from the task axis both to the left (counterclockwise) and to the right (clockwise)
 * Saves the results as properties of this object
 *
 * @returns {MotorMovementRecord}
 */
MotorMovementRecord.prototype.computeMaxDeviationFromTaskAxis = function() {
    var tempEvents = this.getEventsAlignedWithTaskAxis();
    this.maxClockwiseDeviationFromTaskAxis = 0;
    this.maxCounterclockwiseDeviationFromTaskAxis = 0;

    for (var i=0; i<tempEvents.length; i++) {
        this.maxCounterclockwiseDeviationFromTaskAxis = Math.abs(Math.min(tempEvents[i].y, -this.maxCounterclockwiseDeviationFromTaskAxis));
        this.maxClockwiseDeviationFromTaskAxis = Math.max(tempEvents[i].y, this.maxClockwiseDeviationFromTaskAxis);
    }
    return this;
};

/**
 * Creates a tab-separated table with event type, x, y in each row -- useful for plotting
 *
 * @param events
 * @returns {string}
 */
MotorMovementRecord.prototype.pathToPrettyString = function(events) {
    var res = "";
    for (var i=0; i<events.length; i++) {
        res += events[i].type + "\t" + events[i].x + "\t" + events[i].y + "\n";
    }
    return res;
};
