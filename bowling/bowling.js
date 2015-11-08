"use strict";

var BowlingGame = function() {
    this.rolls = [];
    this.currentRoll = 0;
};

BowlingGame.prototype.roll = function(pins) {
    this.rolls[this.currentRoll++] = pins;
};

BowlingGame.prototype.score = function(currentFrameIndex) {
    var score = 0;
    var frameIndex = 0;
    var self = this;

    function sumOfBallsInFrame() {
        return self.rolls[frameIndex] + self.rolls[frameIndex + 1];
    }

    function spareBonus() {
      if(typeof self.rolls[frameIndex + 2] === "undefined") return 0;
    
        return self.rolls[frameIndex + 2];
    }

    function strikeBonus() {
        if((typeof self.rolls[frameIndex + 1] === "undefined") & (typeof self.rolls[frameIndex + 2] === "undefined")) return 0;
        else
        if(typeof self.rolls[frameIndex + 2] === "undefined") return self.rolls[frameIndex + 1];
          
        return self.rolls[frameIndex + 1] + self.rolls[frameIndex + 2];
    }

    function isStrike() {
        return self.rolls[frameIndex] === 10;
    }

    function isSpare() {
      if(typeof self.rolls[frameIndex + 1] === "undefined")  self.rolls[frameIndex+1] = 0;
      
        return self.rolls[frameIndex] + self.rolls[frameIndex + 1] === 10;
    }

    for (var frame = 0; frame < currentFrameIndex; frame++) {
        if (isStrike()) {
            score += 10 + strikeBonus();
            frameIndex++;
        } else if (isSpare()) {
            score += 10 + spareBonus();
            frameIndex += 2;
        } else {
            score += sumOfBallsInFrame();
            frameIndex += 2;
        }
    }
    return score;
};

var game = new BowlingGame();
var results = JSON.parse(localStorage.getItem("results")) || [];
var index = 0;

// document ready?
$(function() {
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  // setup validator
  $('form').validator({
    custom: {
      max: function ($el) {
        var current_input_value = $el.val();

        // Is current input value not a number?
        if (!isNumber(current_input_value)) {
          return true
        };

        // TODO: last row validation
        if ($el.closest('.row').hasClass('last')) {
          return true
        };

        var previous_input_value = $el.closest('.row').find('.first').val();

        return (+current_input_value + +previous_input_value <= 10)
      }
    },
    errors: {
       max: "The frame score should not be more than 10."
    }
  });


  // handle events from validator
  $('form').on('valid.bs.validator', function(event) {
    var current_input = $(event.relatedTarget);
    var current_input_value = current_input.val();
    var previous_input_value = current_input.closest('.row').find('.first').val();

    // -- Fill bowling object --

    if (/^[Xx]$/.test(current_input_value)) {
      game.roll(10);
      //game.roll(0);
    } else if (current_input_value == '/') {
      // ERROR: '/', pass exact number, e.g. 5/5
      game.roll(10 - +previous_input_value);
    } else {
      game.roll(+current_input_value)
    };

    // -- Prepare next inputs --

    // check and hide current input
    current_input.addClass("checked").prop("disabled", true);

    // is it strike?
    if (/^[Xx]$/.test(current_input_value)) {
      // check next input
      // don't check next input if it is last row
      if (!current_input.closest('.row').hasClass('last')) {
        $(this).find('input:not(.checked)').first().addClass("checked");
      }
    };

    //// if last row, second roll, and frame score > 10 then enable third input
    //if (current_input.closest('.row').is('.last, .second') && (+current_input_value + +previous_input_value <= 10)) {

    // show next input
    $(this).find("input:not(.checked)").first().prop("disabled", false);

    //
    //if (current_input.closest('.row').is('.last, .third')) {
    //  $(this).append("<div>" + game.score(index) + "</div>");
    //};

    // -- Increment frame index --

    if (current_input.is('.second, .third')) {
      //if (current_input.is('.second, .third')) {
      $(this).append("<div>" + game.score(index) + "</div>");

      
    }
    if (current_input.is('.first')) {
      $(this).append("<div>" + game.score(index) + "</div>");
      ++index;
    }
  });

  $('form').on('submit', function() {
    // check local storage support
    if(typeof(Storage) !== "undefined") {
      // save results to local storage
      results.push(game.score());
      localStorage.setItem("results", JSON.stringify(results));
    } else {
      alert("Sorry! No Web Storage support..");
    }

    // New game, reset all inputs
    game = new BowlingGame();
  });

  // the most result games
  // TODO: need to implement sort and take first 3, 5, 10
  //$(this).prepend("<div> Top games: " + results.sort.take(3) + "</div>");
});
