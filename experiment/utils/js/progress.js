/**
 * Library for showing progress through a study
 *
 * Created by kgajos on 3/22/19.
 *
 * To get canvas (and therefore the progress bar) to render at high resolution on retina displays, include the following:
 *     <script src="../utils/external/hidpi-canvas.js"></script>
 *
 * Example of usage (from Social Intelligence Test):
 *
 * in HTML:
 <!-- **************  Progress  **************** -->
 <div id="progressBar" class="w800"></div>

 // in JavaScript to define steps:
 this.progressBar = progress();
 this.progressBar.addStep("Consent", "#consent-page", 1, 1)
 .addStep("About you", "#demographics-page", 1, 3)
 .addStep("The test", "#instructions-page", 4, 38)
 .addStep("Final questions", "#comments-page", 1, 1)
 .addStep("Results!", "#results-page", 0, 1);

 // and later to intialize and display:
 this.progressBar.initialize("#progressBar", 800).activateStep("#consent-page");
 */


function progress() {

    var steps = [];
    var triggersToStepNumbers = {};
    var sumOfWeights = 0;
    var curStepNumber = 0;

    var INACTIVE = 0;
    var ACTIVE = 1;
    var DONE = 2;

    var strokeStyle = {0: 'rgb(150,150,150)', 1: 'rgb(0,100,0)', 2: 'rgb(0,100,0)'};
    var fillStyle = {0: 'rgb(0,100,0)', 1: 'rgb(0,100,0)', 2: 'rgb(0,100,0)'};
    var lineWidth = {0: 1, 1: 5, 2: 5};
    var insideTextFillStyle = {0: 'rgb(150,150,150)', 1: 'rgb(255,255,255)', 2: 'rgb(255,255,255)'};
    var font = '12pt Optima, Segoe, sans-serif';
    var radius = 25;
    var margin = 25;

    var width;
    var canvas;
    var ctx = null;

    /**
     * Adds a step to be displayed on the progress bar
     *
     * @param name The name of the step as it should be displayed to the user
     * @param trigger You can optionally specify the id of the page (starting with #) that should trigger
     * activating this step; progress.js is linked to the viewPage() tool in utils.js
     * @param weight A positive number indicating how much relative space this step should get on the progress
     * bar; You can use any number you want (before rendering, all the weights get summed up and what matters
     * is the relative weights between different steps)
     * @param numSubsteps If you want the progress bar to show incremental progress through this step, indicate
     * how many substeps there are in this step
     *
     * @returns self
     */
    var addStep = function (name, trigger, weight, numSubsteps) {
        var stepNumber = steps.length + 1;
        steps.push({
            name: name, trigger: trigger, weight: weight, status: INACTIVE,
            stepNumber: stepNumber, numSubsteps: numSubsteps, progress: 0
        });
        if (trigger)
            triggersToStepNumbers[trigger] = stepNumber;
        sumOfWeights += weight;
        return this;
    };

    /**
     * One time initialization of the progress bar. All the steps should have been added
     * by this point
     *
     * @param selector The ID of the DOM element where the progress bar should be inserted
     * @param canvasWidth The width in pixels that the progress bar is allowed to take
     * @returns self
     */
    var initialize = function (selector, canvasWidth) {
        width = canvasWidth;
        var html = '<canvas id="steps" width="' + width + 'px" height="80px"></canvas>';
        $(selector).html(html);
        canvas = document.getElementById('steps');
        if (canvas.getContext)
            ctx = canvas.getContext('2d');

        if (onViewPage)
            onViewPage(this.activateStep);
        draw();
        return this;
    };

    /**
     * Private function: draws the progress bar
     */
    var draw = function () {
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var lenghtPerWeightUnit = (width - 2 * margin - 2 * radius) / sumOfWeights;
            ctx.font = font;
            var tempWeightSum = 0;
            ctx.textAlign = "center";
            var circleY = radius + 5;

            for (var i = 0; i < steps.length; i++) {
                var curStep = steps[i];
                var nextStep = (i < steps.length) ? steps[i + 1] : null;

                ctx.strokeStyle = strokeStyle[curStep.status];
                ctx.fillStyle = fillStyle[curStep.status];
                ctx.lineWidth = lineWidth[curStep.status];
                ctx.beginPath();
                var x = margin + radius + tempWeightSum * lenghtPerWeightUnit;
                ctx.arc(x, circleY, radius, 0, 2 * Math.PI);
                if (curStep.status == INACTIVE)
                    ctx.stroke();
                else
                    ctx.fill();

                ctx.textBaseline = "top";
                ctx.fillStyle = strokeStyle[curStep.status];
                ctx.fillText(curStep.name, x, circleY + 30);
                ctx.fillStyle = insideTextFillStyle[curStep.status];
                ctx.textBaseline = "middle";
                if (curStep.status == DONE) {
                    ctx.fillText("\u2713", x, circleY); // check mark
                } else {
                    ctx.fillText(curStep.stepNumber, x, circleY);
                }

                if (nextStep) {
                    ctx.lineWidth = lineWidth[nextStep.status];
                    ctx.strokeStyle = strokeStyle[nextStep.status];
                    ctx.beginPath();
                    ctx.moveTo(x + radius, circleY);
                    ctx.lineTo(x + curStep.weight * lenghtPerWeightUnit - radius, circleY);
                    ctx.stroke();
                    if (curStep.status == ACTIVE && curStep.progress) {
                        ctx.lineWidth = lineWidth[curStep.status];
                        ctx.strokeStyle = strokeStyle[curStep.status];
                        ctx.beginPath();
                        ctx.moveTo(x + radius, circleY);
                        ctx.lineTo(x + radius + (curStep.weight * lenghtPerWeightUnit - 2 * radius) * curStep.progress / curStep.numSubsteps, circleY);
                        ctx.stroke();
                    }
                }

                tempWeightSum += curStep.weight;
            }
        }
    };

    /**
     * Specifies which step should be displayed as currently active
     *
     * @param stepNumberOrTrigger step number (first step is number 1) or name of the trigger as
     * specified in addStep()
     * @returns step number if all went well; null if no step could be found for a particular trigger
     */
    var activateStep = function (stepNumberOrTrigger) {
        if (!isNumber(stepNumberOrTrigger)) {
            // if activating a step by trigger, check if the trigger provided is in our list
            if (stepNumberOrTrigger in triggersToStepNumbers)
                stepNumberOrTrigger = triggersToStepNumbers[stepNumberOrTrigger];
            else
                return 0;
        }
        curStepNumber = stepNumberOrTrigger;
        for (var i = 0; i < curStepNumber - 1; i++)
            steps[i].status = DONE;
        steps[curStepNumber - 1].status = ACTIVE;
        for (var i = curStepNumber; i < steps.length; i++) {
            steps[i].status = INACTIVE;
            steps[i].progress = 0;
        }
        draw();
        return curStepNumber;
    };

    /**
     * Advances the progess bar to the next step
     *
     * @returns self
     */
    var activateNextStep = function () {
        activateStep(Math.min(curStepNumber + 1, steps.length));
        return this;
    }

    /**
     * Increments progress *within* the current step
     *
     * @returns self
     */
    var incrementStepProgress = function () {
        steps[curStepNumber - 1].progress = Math.min(steps[curStepNumber - 1].progress + 1, steps[curStepNumber - 1].numSubsteps);
        draw();
        return this;
    }

    return {
        addStep: addStep,
        initialize: initialize,
        activateStep: activateStep,
        activateNextStep: activateNextStep,
        incrementStepProgress: incrementStepProgress,
    }
}