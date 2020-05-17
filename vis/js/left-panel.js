/**
 * Dynamically updating the left-hand panel that contains the car information
 * @param obs   -- The selected observation
 * @param acc   -- The accuracy of the user (0 <= acc <= 1)
 * @param curr  -- The number of the current question (0 < curr <= total)
 * @param total -- The total number of questions in the experiment (should be 40)
 */
function updateLeftPanel(obs, acc, curr, total) {
  console.log(obs);
  var cls = obs.class_pred,
      color = classLevels[cls];

  $(`.class-bar:not(.${color})`).addClass('inactive');
  $(`.class-bar.${color}`).removeClass('inactive');

  $(".feature-item").each(function(i) {
    // Get the name of the variable
    var varName = cls2Var($(this).attr('id'));

    // Get the value of the selected car for that variable
    var val = obs[varName];
    var idx = encodedLevels[varName].findIndex(d => d === val),
        levelData = levels[varName][idx],
        levelName = levelNames[levelData] || levelData;
    $(this).find(".feature-value").html(levelName);
    
    // $(this).find(".point").each(function(j) {
    //   // Set the appropriate number of dots
    //   if (["doors", "capacity (persons)"].includes(varName)) {
    //     if (j <= val - 1) {
    //       $(this).addClass('active');
    //     } else {
    //       $(this).removeClass('active');
    //     }
    //   } else {
    //     if (j <= val) {
    //       $(this).addClass('active');
    //     } else {
    //       $(this).removeClass('active');
    //     }
    //   }
    // })
  });

  // Updating the progress bar
  $('#question-progress').html(`<b>${curr}/${total}</b>`);

  // Updating the accuracy bar
  console.log(acc);
  acc = `${(acc || 0) * 100}%`;

  console.log(acc);
  $('.accuracy-bar-top').css('width', acc);
  $('#accuracy-score').html(`<b>${acc}</b>`);

}

/**
 * Convert a class name (from the HTML) to a variable name
 * @param clsName
 */
function cls2Var(clsName) {
  return clsName.replace(/-/g, ' ');
}