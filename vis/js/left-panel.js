// Dynamically updating the left-hand panel that contains the car information
function updateLeftPanel(obs) {
  var cls = obs.class,
      color = classLevels[cls];

  console.log(obs);

  $(`.class-bar:not(.${color})`).addClass('inactive');
  $(`.class-bar.${color}`).removeClass('inactive');

  $(".feature-item").each(function(i) {
    // Get the name of the variable
    var varName = cls2Var($(this).attr('id'));

    // Get the value of the selected car for that variable
    var val = obs[varName];

    var idx = encodedLevels[varName].findIndex(d => d === val),
        levelName = levelNames[levels[varName][idx]];
    $(this).find(".feature-value").html(levelName);



    $(this).find(".point").each(function(j) {
      // Set the appropriate number of dots
      if (["doors", "capacity (persons)"].includes(varName)) {
        if (j <= val - 1) {
          $(this).addClass('active');
        } else {
          $(this).removeClass('active');
        }
      } else {
        if (j <= val) {
          $(this).addClass('active');
        } else {
          $(this).removeClass('active');
        }
      }
    })
  })
}

/**
 * Convert a class name (from the HTML) to a variable name
 * @param clsName
 */
function cls2Var(clsName) {
  return clsName.replace(/-/g, ' ');
}