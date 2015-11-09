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

$(function() {
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  // setup validator
  $('form').validator({
    custom: {
      max: function ($el) {
        var currentInputValue = $el.val();

        // Is current input value not a number?
        if (!isNumber(currentInputValue)) {
          return true
        };

        //last row
        if ($el.closest('.row').hasClass('last')) {
          return true
        };

        var previousInputValue = $el.closest('.row').find('.first').val();

        return (+currentInputValue + +previousInputValue <= 10)
      }
    },
    errors: {
       max: "The frame score should not be more than 10."
    }
  });


  // handle events from validator
  $('form').on('valid.bs.validator', function(event) {
    var currentInput = $(event.relatedTarget);
    var currentInputValue = currentInput.val();
    var previousInputValue = currentInput.closest('.row').find('.first').val();

    if (currentInput.hasClass('calculateBest')) {
      return true;
    };

    // -- Fill bowling object --

    if (/^[Xx]$/.test(currentInputValue)) {
      game.roll(10);
      $(this).find(".totalScore").html(game.score(index));
    } else if (currentInputValue == '/') {
      game.roll(10 - +previousInputValue);
    } else {
      game.roll(+currentInputValue)
    };

    // -- Prepare next inputs --

    // check and hide current input
    currentInput.addClass("checked").prop("disabled", true);

    // is it strike?
    if (/^[Xx]$/.test(currentInputValue)) {
      // check next input
      // don't check next input if it is last row
      if (!currentInput.closest('.row').hasClass('last')) {
        $(this).find('input:not(.checked)').first().addClass("checked");
      }
    };

    // turn on third input in last row
    if (!currentInput.closest('.row').is('.last, .third')) {
      $(this).find("input:not(.checked)").first().prop("disabled", false);
   } else if (currentInput.is('.second')) {
        if (/^[Xx]$/.test(currentInputValue)) currentInputValue = 10;
        if (/^[/]$/.test(currentInputValue)) {
          currentInputValue = 5;
          previousInputValue = 5;
        }
        if (/^[Xx]$/.test(previousInputValue)) previousInputValue = 10;
        if (+currentInputValue + +previousInputValue >= 10) {
          $(this).find("input:not(.checked)").first().prop("disabled", false);
        }
   } else $(this).find("input:not(.checked)").first().prop("disabled", false);
        
    // -- Increment frame index --

    if (currentInput.is('.second, .third')) {
      $(this).find(".totalScore").html(game.score(index));    
    }
    if (currentInput.is('.first')) {
      $(this).find(".totalScore").html(game.score(index));
      ++index;
    }
  });



  $('form').on('submit', function() {
    // check local storage support
    if(typeof(Storage) !== "undefined") {
      // save results to local storage
      results.push(game.score(10));
      localStorage.setItem("results", JSON.stringify(results));
    } else {
      alert("Sorry! No Web Storage support..");
    }

    // New game, reset all inputs
    game = new BowlingGame();
  });

  
  $('.calculateBest').on('change', function(e) {
    var count = $(this).val();
    var outputResult = "";

    results.sort(function(a,b) {
        if (a < b) { return 1; }
        else if (a == b) { return 0; }
        else { return -1; }
    });

    switch (count) {
      case "3":
        for (var i = 0; i < count; i++) {
          outputResult += results[i] + " ";
        }
        $(".bestResult").html(outputResult);
        break
      case "5":
        for (var i = 0; i < count; i++) {
          outputResult += results[i] + " ";
        }
        $(".bestResult").html(outputResult);
        break
      case "10":
       for (var i = 0; i < count; i++) {
          outputResult += results[i] + " ";
        }
        $(".bestResult").html(outputResult);
       break;
    }
  });
 
});

$(document).ready(function(){
  $('.calculateBest').trigger('change');
});
