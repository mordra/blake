var manifest = [
  {src: "background.jpg", id: "background", w: 1366, h: 768},
  {src: "clock.png", id: "clock", w: 570, h: 1137, scalexy: 0.7, centerReg: true},
  {src: "digital_times.png", id: "digital", w: 553, h: 332, scalexy: 1, centerReg: true},
  {src: "long_minute_hand.png", id: "minuteHand", w: 30, h: 167},
  {src: "hour_hand.png", id: "hourHand", w: 27, h: 117}
];

var MINUTE_INC = 5;

function init() {
  var canvas = document.getElementById('app');
  var stage = new createjs.Stage(canvas);
  stage.mouseEventsEnabled = true;

  var loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", function () {
    onAssetsLoaded(stage, loader);

  });
  loader.loadManifest(manifest, true, "assets/");
};

function onAssetsLoaded(stage, loader) {
  var assets = {};
  var w = stage.canvas.width;
  var h = stage.canvas.height;
  var time = {hour: 0, minute: 0};

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

    assets[asset.id] = shape;
  });

  var clockShape = assets['clock'];
  clockShape.x = w / 4;
  clockShape.y = h / 2;

  var clock = new Clock({
      clock : clockShape,
      minute: assets['minuteHand'],
      hour  : assets['hourHand']
    },
    time,
    function (clockTime) {
      time = clockTime;
      digital.setTime(time);
    }
  );

  var digitalShape = assets['digital'];
  digitalShape.x = w * 3 / 4;
  digitalShape.y = h / 2;

  var digital = new DigitalClock({
    digital: digitalShape
  }, time, function (clockTime) {
    time = clockTime;
    clock.setTime(time);
  });

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", function (e) {
    stage.update(e);
  });

  setInterval(function () {
    updateTime(1);
  }, 1000);

  // as long as window has focus
  window.addEventListener('keydown', function (e) {
    if (e.keyCode == 87 || e.keyCode == 38) {
      updateTime(MINUTE_INC);
    } else if (e.keyCode == 83 || e.keyCode == 40) {
      updateTime(-MINUTE_INC);
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

