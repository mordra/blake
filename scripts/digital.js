(function (window) {
  'use strict';

  function DigitalClock(shapes, time, changeTimeEvent) {
    var self = this;
    this.time = time;
    this.digital = shapes.digital;

    this.input = document.getElementById('timeInput');
    this.input.addEventListener('input', function () {
      self.time = getDigitalTime(self.input.value) || time;
      changeTimeEvent(self.time);
    });

    this.setTime();
  }

  DigitalClock.prototype.setTime = function (time) {
    time = time || this.time;
    this.input.value = pad(Math.floor(time.hour), 2) + ':' + pad(Math.floor(time.minute), 2);
  };

  function getDigitalTime(input) {
    var matches = /(\d{2}):(\d{2})/.exec(input);
    if (!matches)
      return null;

    return {
      hour  : parseInt(matches[1]) || 0,
      minute: parseInt(matches[2]) || 0
    };
  }

  //http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  window.DigitalClock = DigitalClock;
})(window);