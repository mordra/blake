var manifest = [
  {src: "background.jpg", id: "background", w:1366, h:768},
  {src: "clock.png", id: "clock", w:570, h:1137, scalexy:0.4},
  {src: "digital_times.png", id: "digitalTime", w:553, h:332, scalexy:0.4},
  {src: "hour_hand.png", id: "hourHand", w:27, h:117},
  {src: "long_minute_hand.png", id: "minuteHand", w:30, h:167}
];

function init() {
  canvas = document.getElementById("app");
  stage = new createjs.Stage(canvas);

  // grab canvas width and height for later calculations:
  w = stage.canvas.width;
  h = stage.canvas.height;

  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", onAssetsLoaded);
  loader.loadManifest(manifest, true, "assets/");
};


function onAssetsLoaded() {
  var assets = {};
  _.forEach(manifest, function (asset) {
    var ass = new createjs.Shape();
    assets[asset.id] = ass;

    ass.graphics.beginBitmapFill(loader.getResult(asset.id), 'no-repeat').drawRect(0, 0, asset.w || w, asset.h || h);
    ass.scaleX = ass.scaleY = asset.scalexy || 1;
    stage.addChild(ass);
  });

  var groundImg = loader.getResult("background");
  var ground = new createjs.Shape();
  ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, w + groundImg.width, groundImg.height);
  ground.tileW = groundImg.width;
  ground.y = h - groundImg.height;

  hill = new createjs.Bitmap(loader.getResult("hill"));
  hill.setTransform(Math.random() * w, h - hill.image.height * 4 - groundImg.height, 4, 4);
  hill.alpha = 0.5;

  hill2 = new createjs.Bitmap(loader.getResult("hill2"));
  hill2.setTransform(Math.random() * w, h - hill2.image.height * 3 - groundImg.height, 3, 3);

  var spriteSheet = new createjs.SpriteSheet({
    framerate: 30,
    "images": [loader.getResult("grant")],
    "frames": {"regX": 82, "height": 292, "count": 64, "regY": 0, "width": 165},
    // define two animations, run (loops, 1.5x speed) and jump (returns to run):
    "animations": {
      "run": [0, 25, "run", 1.5],
      "jump": [26, 63, "run"]
    }
  });
  grant = new createjs.Sprite(spriteSheet, "run");
  grant.y = 35;

  stage.addChild(sky, hill, hill2, ground, grant);
  stage.addEventListener("stagemousedown", handleJumpStart);

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", tick);
}

function onDigitalClockUpdate() {
  // takes in keypress, updates clock
  // 24hr clock
}

function setClock(time) {
  // time get hour, minute
  // minute is a function of PI
  var minuteHand.angle = time.minute/60 * 2 * Math.PI;

  var hourHand.angle = time.hour/12 * 2 * Math.PI + time.minute/60/12*2*Math.PI;

}

function setDigitalClock(hourHand, minuteHand) {
  // inverse of setClock
}

function onMouseMove(hand, dx, dy) {
  // only called when dragging, will move hand based on center

  var hand.center;
  var hand.angle = Math.tan(dx - hand.center.x / dy - hand.center.y);

}

function onClick(hand) {
  // get the hand under the click

  // attach listener event to hand

  // remove listener on mouse up
}

// hover over a hour/minute hand
function onHover() {

}
//
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