(function (window) {
  'use strict';

  function Clock(shapes, time, changeTimeEvent) {
    var self = this;

    this.time = time;
    this.clock = shapes.clock;
    this.minute = shapes.minute;
    this.hour = shapes.hour;

    this.minute.regX = 30 / 2;
    this.minute.regY = 167 - 5;
    this.minute.x = this.clock.x;
    this.minute.y = this.clock.y;
    this.minute.rotation = 0;

    this.hour.regX = 27 / 2;
    this.hour.regY = 117 - 5;
    this.hour.x = this.clock.x;
    this.hour.y = this.clock.y;

    this.minute.on('pressmove', function (e) {
      self.time = self.calculateMouseMinute(tanToRotation(self.clock.y - e.stageY, e.stageX - self.clock.x));
      changeTimeEvent(self.time);
      self.setTime();
    });

    this.hour.on('pressmove', function (e) {
      self.time = calculateMouseHour(tanToRotation(self.clock.y - e.stageY, e.stageX - self.clock.x));
      changeTimeEvent(self.time);
      self.setTime();
    });
  }

  Clock.prototype.setTime = function (time) {
    this.time = time || this.time;
    console.log('setTime: ' + this.time.hour + ':' + this.time.minute);

    // minute / 60 * 360
    this.minute.rotation = this.time.minute * 6;
    // hour/12 * 360 + minute/60 / 12 * 360
    this.hour.rotation = this.time.hour * 30 + this.time.minute / 2;
  };

  /**
   * Update the time based on minute hand movement
   * If hand moves past 12:00, update hour
   */
  Clock.prototype.calculateMouseMinute = function (rotation) {
    var prevMinute = this.time.minute;

    this.time.minute = Math.floor(rotation / 6);

    if (prevMinute > 50 && this.time.minute < 10) {
      this.time.hour = (this.time.hour + 13) % 12;
    }

    if (prevMinute < 10 && this.time.minute > 50) {
      this.time.hour = (this.time.hour + 11) % 12;
    }

    //console.log('calculateMouseMinute: ' + this.time.hour + ':' + this.time.minute);
    return this.time;
  };

  function calculateMouseHour(rotation) {
    return {
      hour  : Math.floor(rotation / 30),
      minute: (rotation % 30) * 2
    };
  }

  /**
   * Given dy/dx will map atan2 (up 90, right 0, down -90 left 180/-179)
   * to createjs rotation       (up 0, right 90, down 180, left 270)
   */
  function tanToRotation(dy, dx) {
    var angle = -Math.atan2(dy, dx) * 180 / Math.PI;

    if (angle > -90 && angle < 180)
      return angle + 90;

    if (angle >= -180 && angle <= -90)
      return angle + 450;

    return 0;
  }

  window.Clock = Clock;
})(window);