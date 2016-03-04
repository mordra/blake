var manifest = [
  {src: "background.jpg", id: "background", w: 1366, h: 768},
  {src: "clock.png", id: "clock", w: 570, h: 1137, scalexy: 0.7},
  {src: "digital_times.png", id: "digitalTime", w: 553, h: 332, scalexy: 1},
  {src: "hour_hand.png", id: "hourHand", w: 27, h: 117},
  {src: "long_minute_hand.png", id: "minuteHand", w: 30, h: 167}
];

var canvas, stage, timeInput;
var hourHand, minuteHand, digital, clock, prevMinHandAngle = 0, prevHourHandAngle = 0;
var minuteInc = 5;
var time = {hour: 0, minute: 0};
var mousePos = {x: 0, y: 0}, prevMousePos = {x: 0, y: 0};
var isLastActionUserInput = false;

// as long as window has focus
window.addEventListener('keypress', function (e) {
  if (e.charCode == 87 || e.charCode == 119 || e.keyCode == 38) {
    setClocks(updateTime(minuteInc));
  } else if (e.charCode == 83 || e.charCode == 115 || e.keyCode == 40) {
    setClocks(updateTime(-minuteInc));
  }
  isLastActionUserInput = false;
});

function updateTime(inc) {
  if (time.minute + inc >= 60) {
    if (time.hour + 1 > 23)
      time = {hour: 0, minute: (time.minute + inc) % 60};
    else
      time = {hour: time.hour + 1, minute: (time.minute + inc) % 60};
  } else if (time.minute + inc < 0) {
    if (time.hour - 1 < 0)
      time = {hour: 23, minute: 60 + (time.minute + inc)};
    else
      time = {hour: time.hour - 1, minute: 60 + (time.minute + inc)};
  } else {
    time = {hour: time.hour, minute: time.minute + inc};
  }

  return time;
}

function getDigitalTime() {
  var matches = /(\d{2}):(\d{2})/.exec(timeInput.value);
  if (!matches)
    return null;

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
    time = getDigitalTime() || time;
    isLastActionUserInput = true;
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
    mousePos.x = e.stageX;
    mousePos.y = e.stageY;
    if (prevMousePos.x != 0 && prevMousePos.y != 0)
      calculateMouseMinute(mousePos, {x: clock.x, y: clock.y});
    prevMousePos.x = mousePos.x;
    prevMousePos.y = mousePos.y;
    isLastActionUserInput = false;
  });

  hourHand = new createjs.Bitmap('assets/hour_hand.png');
  stage.addChild(hourHand);
  hourHand.regX = 27 / 2;
  hourHand.regY = 117 - 5;
  hourHand.x = clock.x;
  hourHand.y = clock.y;

  hourHand.on('pressmove', function (e) {
    mousePos.x = e.stageX;
    mousePos.y = e.stageY;
    if (prevMousePos.x != 0 && prevMousePos.y != 0)
      calculateMouseHour(mousePos, {x: clock.x, y: clock.y});
    prevMousePos.x = mousePos.x;
    prevMousePos.y = mousePos.y;
    isLastActionUserInput = false;
  });

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", tick);
}

//http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function tanToRotation(angle) {
  angle *= -1;
  if (angle > -90 && angle < 180)
    return angle + 90;

  if (angle >= -180 && angle <= -90)
    return angle + 450;

  return 0;
}

function calculateMouseMinute(mousePos, center) {
  var newAngle = tanToRotation(Math.atan2(center.y - mousePos.y, mousePos.x - center.x) * 180 / Math.PI);

  var prevMinute = time.minute;
  time.minute = Math.floor(newAngle / 6);

  if (prevMinute > 50 && time.minute < 10) {
    time.hour = (time.hour + 13) % 12;
  }

  if (prevMinute < 10 && time.minute > 50) {
    time.hour = (time.hour + 11) % 12;
  }
}

function calculateMouseHour(mousePos, center) {
  var newAngle = tanToRotation(Math.atan2(center.y - mousePos.y, mousePos.x - center.x) * 180 / Math.PI);

  time.hour = Math.floor(newAngle / 30);
  time.minute = (newAngle % 30) * 2;
}

/**
 * Given a time, will set either the analog or digital time or both if not specified
 * @param time - {hour:int, minute:int}
 * @param clockType - analog | digital | null
 */
function setClocks(time, clockType) {
  time.hour %= 24;
  time.minute %= 60;

  if (!clockType || clockType == 'analog') {
    // minute / 60 * 360
    minuteHand.rotation = time.minute * 6;

    // hour/12 * 360 + minute/60 / 12 * 360
    hourHand.rotation = time.hour * 30 + time.minute / 2;
  }

  if ((!clockType || clockType == 'digital') && !isLastActionUserInput) {
    timeInput.value = pad(Math.floor(time.hour), 2) + ':' + pad(Math.floor(time.minute), 2);
  }
}

function tick(event) {
  setClocks(time);
  stage.update(event);
}