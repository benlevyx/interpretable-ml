var selected = [];
var participantEmotion = null;
var participantValence = null;
var participantArousal = null;

var emoScores = {
  "nothing"      : {"valence" : 4, "arousal" : 4},
  "terror"       : {"valence" : 2.8, "arousal" : 6.4},
  "fear"         : {"valence" : 2.9, "arousal" : 6.1},
  "apprehension" : {"valence" : 4.2, "arousal" : 4.2},
  "annoyance"    : {"valence" : 3, "arousal" : 4.1},
  "anger"        : {"valence" : 2.5, "arousal" : 5.9},
  "rage"         : {"valence" : 2.3, "arousal" : 5.2},
  "admiration"   : {"valence" : 7.6, "arousal" : 5.5},
  "trust"        : {"valence" : 7.2, "arousal" : 4.3},
  "acceptance"   : {"valence" : 6.8, "arousal" : 4.3},
  "boredom"      : {"valence" : 2.8, "arousal" : 2.6},
  "disgust"      : {"valence" : 3.3, "arousal" : 5},
  "loathing"     : {"valence" : 2.4, "arousal" : 4.5},
  "ecstasy"      : {"valence" : 7.2, "arousal" : 6.1},
  "joy"          : {"valence" : 8.2, "arousal" : 5.6},
  "serenity"     : {"valence" : 7.8, "arousal" : 3},			
  "pensiveness"  : {"valence" : 3.7, "arousal" : 4.1},			
  "sadness"      : {"valence" : 2.4, "arousal" : 2.8},			
  "grief"        : {"valence" : 2.3, "arousal" : 5},							
  "vigilance"    : {"valence" : 5.7, "arousal" : 3.6},			
  "anticipation" : {"valence" : 5.3, "arousal" : 5.4},			
  "interest"     : {"valence" : 6.7, "arousal" : 4.4},			
  "distraction"  : {"valence" : 4.1, "arousal" : 3.9},			
  "surprise"     : {"valence" : 7.4, "arousal" : 6.6},			
  "amazement"    : {"valence" : 7.3, "arousal" : 6.3}
};

function selectCircle(e) {
  var elName = e.id;
  var index = selected.indexOf(elName);
    if(index > -1) {
      e.style.border="solid 2px #fff";
      if (index > -1) {
         selected.splice(index, 1);
      }
    } else if (selected.length<2){
      e.style.border="solid 2px #000";
      selected.push(elName);
    }
  
  if(selected.length>0) {
    participantEmotion = selected.join("-");
    participantValence = 0.0;
    participantArousal = 0.0;
  
    for (i = 0; i < selected.length; ++i) {
        participantValence += emoScores[selected[i]].valence/selected.length;
        participantArousal += emoScores[selected[i]].arousal/selected.length;
    }
  } else {
    participantEmotion = null;
    participantValence = null;
    participantArousal = null;
  }
}