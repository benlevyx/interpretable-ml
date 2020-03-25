/**
 * Created by kgajos on 10/17/14.
 */

/*
 basic page navigation
 pageID is the CSS identifier of the page to be displayed
 activityData is the additional meta data to be recorded in the sessionFlow
  */
function viewPage(pageID, activityData) {
    //lastPage = curPage;
    var curPage = pageID;
    $(".page").hide();
    $(curPage).show();
    // make sure we show the top of the new page
    window.scrollTo(0,0);
    // if the sessionFlow infrastructure is available, record the transition
    if ('undefined' !== typeof sessionFlow && sessionFlow)
        sessionFlow.recordActivity(pageID, "page_view", activityData);
    var callbacks = [];
    if ("*ALL*" in viewPageListeners)
        callbacks = callbacks.concat(viewPageListeners["*ALL*"]);
    if (pageID in viewPageListeners)
        callbacks = callbacks.concat(viewPageListeners[pageID]);
    for(var i=0; i<callbacks.length; i++)
        callbacks[i](pageID);
    return $(curPage);
}

var viewPageListeners = {};

/*
Register event listeners to be fired when a particular page is viewed
if pageID is specified, callback will be called only if that page with pageID is shown
if pageID is not specified, callback will be called every time viewPage is called
 */
function onViewPage(callback, pageID) {
    if (!pageID)
        pageID = "*ALL*";
    if (!(pageID in viewPageListeners))
        viewPageListeners[pageID] = [];
    viewPageListeners[pageID].push(callback);
}


// get a value of a variable passed through the URL
function getQueryVariable(variable, defaultValue)
{
    if ('undefined' === typeof b) {
        b = false;
    }
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(defaultValue);
}

var QueryString = function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]], pair[1] ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    }
    return query_string;
} ();

// results for all other participants will be stored here once retrieved
var globalResults;

function fetchGlobalResults(resultsURL, callback) {
    $.ajax({
        url: resultsURL,
        type: "GET",
        data: {},
        success: function( data ) {
            if (debug)
                console.log("global results fetched: " + JSON.stringify(data));
            globalResults = data;
            if (callback)
                callback(data);
        },
        error: function() {
            console.log("Failed to fetch global results from server!");
        }
    });
}


// checking if we are running on local host
function isRunningOnLocalHost() {
    return "localhost" == location.hostname;
}

// pre-fills a form with information from a cookie
function prefillFormFromCookie(formSelector, cookieName) {
    var cookie = Cookies.getJSON(cookieName);
    var els = {};
    if (typeof cookie !== 'undefined') {
        $(formSelector + " :input").each(function() {
            if (typeof $(this).attr("name") !== 'undefined')
                els[$(this).attr("name")] = $(this).attr("type");
        });
        for (elementName in els) {
            if (elementName in cookie) {
                if (els[elementName] == "radio") {
                    var selector = formSelector + " [name=" + elementName + '][value="' + cookie[elementName] + '"]';
                    $(formSelector + " [name=" + elementName + '][value="' + cookie[elementName] + '"]').prop("checked", true);
                } else {
                    $(formSelector + " [name=" + elementName + ']').val(cookie[elementName]);
                }
            }
        }
    }
}


// if you call this function, a window size check will be performed immediately and each time the
// browser window is resized; if the window size is smaller than the minimum values provided, the
// user will be asked to make the window taller/wider or both.  Additional advice can include, for
// example, a request to keep a tablet in a portrait mode or a warning that the study won't work on
// a phone
function enableWindowSizeCheck(minimumWidth, minimumHeight, additionalAdvice) {
    $("body").append('<!-- dialog box to be displayed when the window is too small -->'
    + '<div class="modal fade" id="sizeCheckDialog" tabindex="-1" data-backdrop="static" role="dialog" aria-labelledby="dialog-sizeCheck" aria-hidden="true">'
    + '    <div class="modal-dialog">'
    + '        <div class="modal-content">'
    + '            <div class="modal-header">'
    + '                <h4 class="modal-title" id="sizeCheckAdvice"></h4>'
    + '            </div>'
    + '            <div class="modal-body" id="sizeCheckDialog_additionalInstructions">' + additionalAdvice
    + '            </div>'
    + '        </div>'
    + '    </div>'
    + '</div>');

    if (additionalAdvice)
        $("#sizeCheckDialog_additionalInstructions").html(additionalAdvice);

    // make sure that the window is large enough to display the study UI
    windowSizeCheckHelper(minimumWidth, minimumHeight);
    // add event handler for resizing the screen
    window.onresize = function() {windowSizeCheckHelper(minimumWidth, minimumHeight)};
}


// make sure that the window is certain minimum size
function windowSizeCheckHelper(minimumWidth, minimumHeight) {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    if (windowWidth < minimumWidth || windowHeight < minimumHeight) {
        var message = "";
        if (windowWidth < minimumWidth && windowHeight < minimumHeight) {
            message = "Please make your browser window taller and wider";
        } else if (windowWidth < minimumWidth) {
            message = "Please make your browser window wider";
        } else if (windowHeight < minimumHeight) {
            message = "Please make your browser window taller";
        }

        $("#sizeCheckAdvice").html(message);
        $("#sizeCheckDialog").modal('show');
    } else {
        $("#sizeCheckDialog").modal('hide');
    }
}

var utilsScriptURL = document.currentScript.src;

// use loadImages method to ensure that all images are loaded before test proceeds.  A blocking popup will be shown
// if any images are still loading.  Requires Bootstrap js.
var imagePreloader = {
    forPreloading: [],
    images: [],

    mediaDirectoryURL: utilsScriptURL.substring(0, utilsScriptURL.length - 8) + "../media/",

    // takes an array of image URLs and starts preloading them in the background
    preloadImages: function(imageURLs) {
        for(i=0; i<imageURLs.length; i++) {
            var img = new Image();
            img.src = imageURLs[i];
            this.forPreloading.push(img);
        }
    },

    ensureImages: function(imageURLs) {
        var self = this;
        for(i=0; i<imageURLs.length; i++) {
            var img = new Image();
            img.onload = function() {self.checkLoadingProgress(self)};
            img.src = imageURLs[i];
            this.images.push(img);
        }
        this.checkLoadingProgress(this);
    },

    // internal -- do not call directly
    checkLoadingProgress: function(self) {
        var allLoaded = true;
        var numLoaded = 0;
        for(i=0; i<self.images.length; i++) {
            if (self.images[i].complete)
                numLoaded++;
            else
                allLoaded = false;
        }
        if (allLoaded) {
            if ($("#imagesLoadingDialog").length)
                $("#imagesLoadingDialog").modal('hide');
        } else {
            if (!$("#imagesLoadingDialog").length)
                $("body").append('<!-- dialog box to be displayed when the system cannot proceed until images are loaded -->'
                + '<div class="modal fade" id="imagesLoadingDialog" tabindex="-1" data-backdrop="static" role="dialog" aria-labelledby="dialog-imageLoadCheck" aria-hidden="true">'
                + '    <div class="modal-dialog">'
                + '        <div class="modal-content">'
                + '            <div class="modal-header">'
                + '                <h4 class="modal-title">Please wait just a moment</h4>'
                + '            </div>'
                + '            <div class="modal-body">'
                + '                 <p><img src="' + this.mediaDirectoryURL + "fetch2b.png"
                + '" width="200px" alt="" align="right" />We need to fetch a few things from the Internet.</p><br/><br/>'
                + '                 <p>Loading resource <span id="loadingImageNumber"></span> out of <span id="numImagesToLoad"></span></p>'
                + '<br clear="right"/>'
                + '            </div>'
                + '        </div>'
                + '    </div>'
                + '</div>');
            $("#numImagesToLoad").html(self.images.length);
            $("#loadingImageNumber").html(numLoaded + 1);
            $("#imagesLoadingDialog").modal('show');
        }

    }

};

// checks if a particular value is a number
function isNumber(v) {
    return !isNaN(+v) && isFinite(v);
}

function enterFullScreen() {
    var element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

// **********************************
// ****  DATA SENDER             ****
// **********************************

// requires jQuery
//
// A module that handles buffering streams of data and sending them to the mothership once large enough chunks of data
// have been collected.  Useful for mouse trajectory tracking, detailed activity logging, etc., where we do not want to
// initiate a connection each time a new piece of data has been collected, but we also do not want to wait till the very
// end of the study.
//
// The module will make repeated attempts to send the data if the initial attempt fails.
//
// you initialize the module as follows:
// var myDataSender = dataSender("dataReceiver.php", {participantID: 56})
//
// You can have as many dataSenders in your project as you want and they can all be sending data to different destinations
//
// Parameters:
// destination URL -- the URL to which the data should be sent
// metadata -- an arbitrary JavaScript object capturing whatever metadata you want to include with each data transmission
// (e.g., {participantID: 52})
function dataSender(destinationURL, metadata) {
    // debug flag for this module
    var debug = 0;

    // metadata to be included with each data transmission
    var curMetadata = metadata;

    // setting this variable to false will cause data transmissions to be suspended completely
    var dataTransmissionEnabled = true;

    // data waiting to be sent
    var dataQueue = [];

    // data currently being transmitted
    var transmissionBuffer = [];

    // by default it is set to 0 meaning that new transmission will be attempted each time a new piece of data
    // is added to the queue
    var maxDataQueueSize = 0;

    // internal variable; set to true if there is a data transmission in progress; set to false otherwise
    var currentlyTransmitting = false;

    var lastTransmissionFailed = false;

    var forceNextSend = true;

    var sendCheck = function() {
        if (!currentlyTransmitting && dataTransmissionEnabled
            && (dataQueue.length > maxDataQueueSize || lastTransmissionFailed || forceNextSend)
        ) {
            send();
            forceNextSend = false;
        }
    };

    var send = function() {
        if (currentlyTransmitting || !dataTransmissionEnabled)
            return;
        currentlyTransmitting = true;

        transmissionBuffer = dataQueue;
        dataQueue = [];

        if (transmissionBuffer.length > 0)
            $.ajax({
                url: destinationURL,
                type: "POST",
                data: {metadata: JSON.stringify(curMetadata), data: JSON.stringify(transmissionBuffer)},
                success: function( response ) {
                    if (debug) {
                        console.log("Data transmission sent: " + (transmissionBuffer ? JSON.stringify(transmissionBuffer) : " [[nada]]"));
                        console.log("Response: " + response);
                    }
                    currentlyTransmitting = false;
                    lastTransmissionFailed = false;
                    // check if enough data have accumulated that another transmission is needed
                    sendCheck();
                },
                error: function() {
                    console.log("Failed to transmit data:" + (transmissionBuffer ? JSON.stringify(transmissionBuffer) : " [[nada]]"));
                    // return data to the transmission buffer
                    dataQueue = transmissionBuffer.concat(dataQueue);
                    transmissionBuffer = [];
                    currentlyTransmitting = false;
                    // make another attempt
                    lastTransmissionFailed = true;
                    sendCheck();
                }
            });
        else
            currentlyTransmitting = false;
    };

    return {
        // add a single piece of data to the transmission queue
        recordDatum: function(oneDataItem) {
            dataQueue.push(oneDataItem);
            sendCheck();
            return this;
        },

        // add multiple data items to the transmission queue
        recordDataArray: function(dataArray) {
            dataQueue = dataQueue.concat(dataArray);
            sendCheck();
            return this;
        },

        // set the size of the data queue that will trigger the next send attempt
        setMaxDataQueueSize: function(newMaxDataQueueSize) {
            maxDataQueueSize = newMaxDataQueueSize;
            sendCheck();
            return this;
        },

        // force an attempt to send the data (if a transmission is currently in progress, a new transmission will be
        // attempted after the current one ends)
        // forceSend will *not* work if data transmission is disabled!
        forceSend: function() {
            forceNextSend = true;
            sendCheck();
            return this;
        },

        // set/update metadata that get sent with each transmission
        setMetadata: function(metadata) {
            curMetadata = metadata;
            return this;
        },

        // enables/disables data transmission (by default, data transmission is enabled)
        setDataTransmissionEnabled: function(enabled) {
            dataTransmissionEnabled = enabled;
            sendCheck();
            return this;
        },

        setDebugEnabled: function(enabled) {
            debug = enabled;//integer
            return this;
        },

        // returns true if data transmission is enabled, false otherwise
        isDataTransmissionEnabled: function() {
            return dataTransmissionEnabled;
        },

        // returns true if a transmission is currently in progress, false otherwise
        isTransmitting: function() {
            return currentlyTransmitting;
        },

        // returns true if the last transmission attempt resulted in an error, false otherwise
        hasLastTransmissionFailed: function() {
            return lastTransmissionFailed;
        },

        // returns the number of items stored in the data queue (excludes the items that are in the current
        // transmission buffer)
        getDataQueueSize: function() {
            return dataQueue.length;
        },

        setDebugFlag: function(d) {
            debug = d;
            return this;
        }

    }
}

/*
 * requires jQuery.  Takes multiple URLs and performs $.get() on the first one -- if that fails, moves to the next one and so on.
 * urls is a list of urls
 * data is a dictionary of argument to send with the get request
 * success is the callback function to call when get succeeds
 * fail is the callback function to call if all urls fail
 */
function httpGet(urls, data, successCallback, failCallback) {
    httpGetHelper(urls, data, successCallback, failCallback, {})
}

function httpGetHelper(urls, data, successCallback, failCallback, res) {
    if (urls.length > 0) {
        var url = urls.shift();
        $.get(url, data, successCallback).fail(function(info) {
            res[url] = info;
            return httpGetHelper(urls, data, successCallback, failCallback, res);
        });
    } else {
        failCallback(res)
    }
}


/************************
 * Object-oriented tools
 ************************/

// from http://phrogz.net/JS/classes/OOPinJS2.html
Function.prototype.inheritsFrom = function( parentClassOrObject ) {
    if ( parentClassOrObject.constructor == Function )
    {
        //Normal Inheritance
        this.prototype = new parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject.prototype;
    }
    else
    {
        //Pure Virtual Inheritance
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
};


/************************
 * Geometry tools
 ************************/

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}


/************************
 * Event handlers to install automatically
 ************************/

/**
 * augment all links of class "LITWreferral" such that the current participant ID gets attached to the urls
 * (to enable referral tracking across experiments)
 */


/*
Commenting this code away because it appears to be buggy -- it removes GET parameters from existing URLs

$(function() {
    $(".LITWreferral").click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        var href = this.href;
        var parts = href.split('?');
        var url = parts[0];
        var params = parts[1] ? parts[1].split('&') : [];
        params.push("rpid=" + participantID);
        var pp, inputs = '';
        for(var i = 0, n = params.length; i < n; i++) {
            pp = params[i].split('=');
            inputs += '<input type="hidden" name="' + pp[0] + '" value="' + pp[1] + '" />';
        }
        $("#poster").remove();
        $("body").append('<form action="'+url+'" target="_blank" method="post" id="poster">'+inputs+'</form>');
        $("#poster").submit();
    });
});
 */