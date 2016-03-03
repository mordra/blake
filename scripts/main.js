var manifest = [
  {src: "background.jpg", id: "background", w: 1366, h: 768},
  {src: "clock.png", id: "clock", w: 570, h: 1137, scalexy: 0.7},
  {src: "digital_times.png", id: "digitalTime", w: 553, h: 332, scalexy: 1},
  {src: "hour_hand.png", id: "hourHand", w: 27, h: 117},
  {src: "long_minute_hand.png", id: "minuteHand", w: 30, h: 167}
];

var canvas, stage, timeInput, hourHand, minuteHand, digital, clock, prevMinHandAngle = 0, prevHourHandAngle = 0;

var minuteInc = 5;
// as long as window has focus
window.addEventListener('keypress', function (e) {
  if (e.charCode == 87 || e.charCode == 119 || e.keyCode == 38) {
    var curTime = getCurrentTime();
    setTime(updateTime(curTime, minuteInc));
  } else if (e.charCode == 83 || e.charCode == 115 || e.keyCode == 40) {
    var curTime = getCurrentTime();
    setTime(updateTime(curTime, -minuteInc));
  }
});

function updateTime(time, inc) {
  if (time.minute + inc >= 60) {
    if (time.hour + 1 > 23)
      return {hour: 0, minute: (time.minute + inc) % 60};
    else
      return {hour: time.hour + 1, minute: (time.minute + inc) % 60};
  } else if (time.minute + inc < 0) {
    if (time.hour - 1 < 0)
      return {hour: 23, minute: 60 + (time.minute + inc)};
    else
      return {hour: time.hour - 1, minute: 60 + (time.minute + inc)};
  } else {
    return {hour: time.hour, minute: time.minute + inc};
  }
}

function getCurrentTime() {
  var matches = /(\d{2}):(\d{2})/.exec(timeInput.value);
  if (!matches)
    return {hour: 0, minute: 0};

  return {
    hour  : parseInt(matches[1]) || 0,
    minute: parseInt(matches[2]) || 0
  };
}

function init() {
  canvas = document.getElementById('app');
  timeInput = document.getElementById('timeInput');

  stage = new createjs.Stage(canvas);
  stage.mouseEventsEnabled = true;

  timeInput.addEventListener('input', function () {
    var curTime = getCurrentTime();
    setTime(curTime, 'analog');
  });

  // grab canvas width and height for later calculations:
  w = stage.canvas.width;
  h = stage.canvas.height;

  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", onAssetsLoaded);
  loader.loadManifest(manifest, true, "assets/");
};

function onAssetsLoaded() {
  var assets = {};

  var background = new createjs.Bitmap('assets/background.jpg');
  stage.addChild(background);

  clock = new createjs.Bitmap('assets/clock.png');
  stage.addChild(clock);
  clock.regX = 570 / 2;
  clock.regY = 1137 / 2;
  clock.scaleX = clock.scaleY = 0.7;
  clock.x = w / 4;
  clock.y = h / 2;

  digital = new createjs.Bitmap('assets/digital_times.png');
  stage.addChild(digital);
  digital.regX = 553 / 2;
  digital.regY = 332 / 2;
  digital.x = w * 3 / 4;
  digital.y = h / 2;

  minuteHand = new createjs.Bitmap('assets/long_minute_hand.png');
  stage.addChild(minuteHand);
  minuteHand.regX = 30 / 2;
  minuteHand.regY = 167 - 5;
  minuteHand.x = clock.x;
  minuteHand.y = clock.y;
  minuteHand.rotation = 0;

  minuteHand.on('pressmove', function (e) {
    var angle = Math.atan2(clock.y - e.stageY, e.stageX - clock.x) * 180 / Math.PI;
    console.log('angle: ' + angle);
    minuteHand.rotation = 90 - angle;
    console.log('rotation: ' + minuteHand.rotation);
    getTimeFromAnalog(minuteHand.rotation, hourHand.rotation, prevMinHandAngle, prevHourHandAngle);
  });

  hourHand = new createjs.Bitmap('assets/hour_hand.png');
  stage.addChild(hourHand);
  hourHand.regX = 27 / 2;
  hourHand.regY = 117 - 5;
  hourHand.x = clock.x;
  hourHand.y = clock.y;

  hourHand.on('pressmove', function (e) {
    var angle = Math.atan2(clock.y - e.stageY, e.stageX - clock.x) * 180 / Math.PI;
    hourHand.rotation = 90 - angle;
    getTimeFromAnalog(minuteHand.rotation, hourHand.rotation, prevMinHandAngle, prevHourHandAngle);
  });

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", tick);
}

function getTimeFromAnalog(minuteRotation, hourRotation, prevMinuteRotation, prevHourRotation) {

  console.log('angle from rotation: ' + (-minuteRotation));
  var time = {hour:0, minute:0};
  time.minute = (-minuteRotation)

  if (minuteRotation !== prevMinuteRotation) {
    console.log('minute hand moved from ' + prevMinuteRotation + ' to ' + minuteRotation);
    if (minuteRotation > 0 && prevMinuteRotation < 0) {

    }
  }

  if (hourRotation !== prevHourRotation) {
    console.log('hour hand didnt move');
  }
}

/**
 * Given a time, will set either the analog or digital time or both if not specified
 * @param time - {hour:int, minute:int}
 * @param clockType - analog | digital | null
 */
function setTime(time, clockType) {
  time.hour %= 24;
  time.minute %= 60;

  if (!clockType || clockType == 'analog') {
    minuteHand.rotation = time.minute / 60 * 360;
    hourHand.rotation = time.hour / 12 * 360 + time.minute / 60 / 12 * 360;
  }

  prevMinHandAngle = minuteHand.rotation;
  prevHourHandAngle = hourHand.rotation;

  if (!clockType || clockType == 'digital') {
    timeInput.value = ('00' + time.hour).slice(-2) + ':' + ('00' + time.minute).slice(-2);
  }
}

function tick(event) {
  //var deltaS = event.delta / 1000;
  //var position = grant.x + 150 * deltaS;
  //
  //var grantW = grant.getBounds().width * grant.scaleX;
  //grant.x = (position >= w + grantW) ? -grantW : position;
  //
  //ground.x = (ground.x - deltaS * 150) % ground.tileW;
  //hill.x = (hill.x - deltaS * 30);
  //if (hill.x + hill.image.width * hill.scaleX <= 0) {
  //  hill.x = w;
  //}
  //hill2.x = (hill2.x - deltaS * 45);
  //if (hill2.x + hill2.image.width * hill2.scaleX <= 0) {
  //  hill2.x = w;
  //}

  stage.update(event);
}