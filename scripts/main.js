(function (window) {
  'use strict';

  var MINUTE_INC = 5;
  var stage, loader;

  var manifest = [
    {src: "background.jpg", id: "background", w: 1366, h: 768},
    {src: "clock.png", id: "clock", w: 570, h: 1137, scalexy: 0.7, centerReg: true, x: 1 / 4, y: 1 / 2},
    {src: "digital_times.png", id: "digital", w: 553, h: 332, scalexy: 1, centerReg: true, x: 3 / 4, y: 1 / 2},
    {src: "long_minute_hand.png", id: "minuteHand", w: 30, h: 167},
    {src: "hour_hand.png", id: "hourHand", w: 27, h: 117}
  ];

  function init() {

    var canvas = document.getElementById('app');
    stage = new createjs.Stage(canvas);
    stage.mouseEventsEnabled = true;

    loader = new createjs.LoadQueue(false);
    loader.addEventListener("complete", function () {
      var shapes = initShapes();
      main(shapes);
    });
    loader.loadManifest(manifest, true, "assets/");
  };

  function initShapes() {
    var shapes = {};
    var w = stage.canvas.width;
    var h = stage.canvas.height;

    _.forEach(manifest, function (asset) {
      var shape = new createjs.Shape();

      shape.graphics.beginBitmapFill(loader.getResult(asset.id)).drawRect(0, 0, asset.w, asset.h);
      stage.addChild(shape);

      if (asset.centerReg) {
        shape.regX = asset.w / 2;
        shape.regY = asset.h / 2;
      }

      if (asset.scalexy) {
        shape.scaleX = shape.scaleY = asset.scalexy;
      }

      shape.x = asset.x * w || shape.x;
      shape.y = asset.y * h || shape.y;

      shapes[asset.id] = shape;
    });

    return shapes;
  }

  function main(shapes) {
    var time = {hour: 0, minute: 0};

    var clock = new Clock({
        clock : shapes['clock'],
        minute: shapes['minuteHand'],
        hour  : shapes['hourHand']
      },
      time,
      function (clockTime) {
        time = clockTime;
        digital.setTime(time);
      }
    );

    var digital = new DigitalClock({
      digital: shapes['digital']
    }, time, function (clockTime) {
      time = clockTime;
      clock.setTime(time);
    });

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", function (e) {
      stage.update(e);
    });

    // ticking timer
    var isTimer = true;
    var timer = function () {
      updateTime(1)
    };
    var timerHandle = setInterval(timer, 1000);

    // window rather than canvas focus
    window.addEventListener('keydown', function (e) {
      if (e.keyCode == 87 || e.keyCode == 38) {
        updateTime(MINUTE_INC);
      } else if (e.keyCode == 83 || e.keyCode == 40) {
        updateTime(-MINUTE_INC);
      } else if (e.keyCode == 32) {
        isTimer = !isTimer;
        if (isTimer)
          timerHandle = setInterval(timer, 1000);
        else
          clearInterval(timerHandle);
      }
    });

    function updateTime(inc) {
      if ((time.minute + inc) >= 0) {
        time.hour += Math.floor((time.minute + inc) / 60);
      } else {
        time.hour = (time.hour + 11) % 12;
      }

      time.minute = (time.minute + inc + 60) % 60;

      clock.setTime(time);
      digital.setTime(time);
    }
  }

  window.init = init;
})(window);