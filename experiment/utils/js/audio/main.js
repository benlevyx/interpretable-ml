/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var contextIsSet = 0
var initializedAudio = 0

var isBlobRecorded = 0;
var shouldSendBlob = 0;

var audioContext = null;
audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;

//show audio feature only in chrome/firefox:
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

function saveAudio() {
    window.isBlobRecorded = 1;
    // could get mono instead by saying
    //audioRecorder.exportMonoWAV( doneEncoding );
}

function uploadAudioWrapper() {
    if(window.isBlobRecorded){
        audioRecorder.exportWAV( doneEncoding );
    }
}

function gotBuffers( buffers ) {
    // the ONLY time gotBuffers is called is right after a new recording is completed - 
    // so here's where we should set up the download.
    //audioRecorder.exportWAV( doneEncoding );
}

function doneEncoding( blob ) {
    uploadAudio(blob);
}

function uploadAudio( blob ) {
  var reader = new FileReader();
  reader.onload = function(event){
    var fd = {};
    var uid = Date.now();
    fd["participant_id"] = window.participantID;
    fd["file_id"] = uid;
    fd["audio"] = event.target.result;
    $.ajax({
      type: 'POST',
      crossDomain: true,
      url: 'http://52.24.39.220/upload.php',
      data: fd,
      dataType: 'text'
    }).done(function(data) {
        console.log(data);
    });
  };
  reader.readAsDataURL(blob);
}

function toggleRecording( e ) {
    //if(!audioContext) {
    //     audioContext = new AudioContext();
    //}
    if(!contextIsSet){
        contextIsSet=1;
        initAudio();
        //e.classList.add("recording");
        //window.addEventListener('load', initAudio );
    } else if(initializedAudio) {
        initializedAudio = 0;
    } else if (e.classList.contains("recording")) {
        // stop recording
        window.isBlobRecorded = 1;
        document.getElementById("analyser").style.visibility='hidden';
        audioRecorder.stop();
        e.classList.remove("recording");
        audioRecorder.getBuffers( gotBuffers );
        //saveAudio();
    } else {
        // start recording
        if (!audioRecorder) {
            alert("audioRecorder not working!");
            return;
        }
        e.classList.add("recording");
        audioRecorder.clear();
        audioRecorder.record();
        document.getElementById("analyser").style.visibility='visible';
    }
}

function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame( rafID );
    rafID = null;
}

function updateAnalysers(time) {
    if (!analyserContext) {
        var canvas = document.getElementById("analyser");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
    }

    if(window.isBlobRecorded && $("#gotrecord").css("visibility")=='hidden') {
        $("#gotrecord").css({"visibility":"visible"});
        $("#deleterecord").css({"visibility":"visible"});
        $("#audioBool").val('1');
    }

    if(!window.isBlobRecorded && $("#gotrecord").css("visibility")=='visible') {
        $("#gotrecord").css("visibility",'hidden');
        $("#deleterecord").css("visibility",'hidden');
        $("#audioBool").val('0');
    }

    // analyzer draw code here
    {
        var SPACING = 3;
        var BAR_WIDTH = 10;
        var numBars = 1;
        var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

        analyserNode.getByteFrequencyData(freqByteData); 

        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.fillStyle = '#F6D565';
        analyserContext.lineCap = 'round';
        var multiplier = analyserNode.frequencyBinCount / numBars;

        // Draw rectangle for each frequency bin.
        for (var i = 0; i < numBars; ++i) {
            var magnitude = 0;
            var offset = Math.floor( i * multiplier );
            // gotta sum/average the block, or we miss narrow-bandwidth spikes
            for (var j = 0; j< multiplier; j++)
                magnitude += freqByteData[offset + j];
            magnitude = magnitude / multiplier;
            var magnitude2 = freqByteData[i * multiplier];
            analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
            analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude*0.5);
        }
    }
    
    rafID = window.requestAnimationFrame( updateAnalysers );
}

function toggleMono() {
    if (audioInput != realAudioInput) {
        audioInput.disconnect();
        realAudioInput.disconnect();
        audioInput = realAudioInput;
    } else {
        realAudioInput.disconnect();
        audioInput = convertToMono( realAudioInput );
    }

    audioInput.connect(inputPoint);
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

//    audioInput = convertToMono( input );

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );
    audioRecorder = new Recorder( inputPoint );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
    updateAnalysers();
        // start recording
    //if (!audioRecorder) {
        //alert("audioRecorder not initialized!");
    //    return;
    //}
    //audioRecorder.clear();
    //audioRecorder.record();
    //document.getElementById("analyser").style.visibility='visible';
    //alert("recording started!");
}

function initAudio() {
    initializedAudio = 1
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
    navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function(e) {
            alert('Error getting audio, please write your comment instead.');
            console.log(e);
        });
}
