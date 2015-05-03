var React = require('react');

var AudioChannel = React.createClass({
  componentDidMount: function() {
    new Waveform({
        container: React.findDOMNode(this),
        data: [0.01, 0.02, 0.011, 0.017, 0.016, 0.007, 0.015, 0.01, 0.011,
            0.01, 0.025, 0.013, 0.01, 0.3, 0.3, 0., 0.32, 0.2, 0.2, 0.2, 0.18,
            0.30, 0.1, 0.24, 0.1, 0.2, 0.23, 0.2, 0.23, 0., 0.2, 0.21, 0.23,
            0.25, 0.26, 0.2, 0.28, 0.2, 0.24, 0.22, 0.21, 0.17, 0.25, 0.25,
            0.26, 0.18, 0.22, 0.17, 0.24, 0.22, 0.09, 0.12, 0.2, 0.13, 0.22,
            0.2, 0.20, 0.29, 0.25, 0.31, 0.25, 0.26, 0.20, 0.37, 0.29, 0.,
            0.34, 0.2, 0.26, 0.17, 0.2, 0., 0.29, 0., 0.1, 0.18, 0.29, 0.2,
            0.27, 0.18, 0.19, 0.24, 0.24, 0.21, 0.26, 0.19, 0.18, 0.23, 0.3,
            0.3, 0.3, 0.29, 0.24, 0.3, 0.3, 0.15, 0.1, 0.23, 0.2, 0.23, 0.18,
            0.2, 0.2, 0.30, 0.2, 0.20, 0., 0.29, 0.3, 0.1, 0.14, 0.1, 0.,
            0.27, 0.23, 0.29, 0.18, 0.20, 0.1, 0.3, 0.23, 0.27, 0.19, 0.2,
            0.19, 0.22, 0.19, 0.12, 0.23, 0.21, 0.12, 0.1, 0.1, 0.1, 0.15,
            0.24, 0.1, 0.1, 0.1, 0.1, 0.14, 0.13, 0.10, 0.11, 0.13, 0.1, 0.10,
            0.10, 0.1, 0.14, 0.13, 0.12, 0.1, 0.1, 0.14, 0.13, 0.14, 0.12,
            0.1, 0.12, 0.1, 0.16, 0.1, 0.1, 0.16, 0.15, 0.1, 0.13, 0.15, 0.1,
            0.13, 0.16, 0.15, 0.12, 0.14, 0.13, 0.13, 0.14, 0.13, 0.17, 0.16,
            0.17, 0.14, 0.1, 0.16, 0.1, 0.15, 0.14, 0.08, 0.1, 0.11, 0.1,
            0.09, 0.11, 0.1, 0.11, 0.10, 0.10, 0.11, 0.10, 0.0, 0.08, 0.07,
            0.05, 0.04, 0.023, 0.007, 0.007, 0.007, 0.015, 0.00, 0.008, 0.007,
            0.007, 0.007, 0.007, 0.0, 0.010],
        innerColor: '#3B8686',
        height: 50
      });
  },
  render: function() {
    return (
      <div>
      </div>
    );
  }
});
__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
var Waveform;
Waveform.name = 'Waveform';

function Waveform(options) {
  this.redraw = __bind(this.redraw, this);
  this.container = options.container;
  this.canvas = options.canvas;
  this.data = options.data || [];
  this.outerColor = options.outerColor || "transparent";
  this.innerColor = options.innerColor || "#000000";
  this.interpolate = true;
  if (options.interpolate === false) {
    this.interpolate = false;
  }
  if (this.canvas == null) {
    if (this.container) {
      this.canvas = this.createCanvas(this.container, options.width || this.container.clientWidth, options.height || this.container.clientHeight);
    } else {
      throw "Either canvas or container option must be passed";
    }
  }
  this.patchCanvasForIE(this.canvas);
  this.context = this.canvas.getContext("2d");
  this.width = parseInt(this.context.canvas.width, 10);
  this.height = parseInt(this.context.canvas.height, 10);
  if (options.data) {
    this.update(options);
  }
}

Waveform.prototype.setData = function(data) {
  return this.data = data;
};

Waveform.prototype.setDataInterpolated = function(data) {
  return this.setData(this.interpolateArray(data, this.width));
};

Waveform.prototype.setDataCropped = function(data) {
  return this.setData(this.expandArray(data, this.width));
};

Waveform.prototype.update = function(options) {
  if (options.interpolate != null) {
    this.interpolate = options.interpolate;
  }
  if (this.interpolate === false) {
    this.setDataCropped(options.data);
  } else {
    this.setDataInterpolated(options.data);
  }
  return this.redraw(0.0);
};

Waveform.prototype.redraw = function(percent) {
  var d, i, middle, t, _i, _len, _ref, _results;
  this.clear();
  if (typeof this.innerColor === "function") {
    this.context.fillStyle = this.innerColor();
  } else {
    this.context.fillStyle = this.innerColor;
  }
  middle = this.height / 2;
  i = 0;
  _ref = this.data;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    d = _ref[_i];
    t = this.width / this.data.length;
    if (typeof this.innerColor === "function") {
      this.context.fillStyle = this.innerColor(i / this.width, d);
    }
    this.context.clearRect(t * i, middle - middle * d, t, middle * d * 2);
    this.context.fillRect(t * i, middle - middle * d, t, middle * d * 2);
    _results.push(i++);
  }
  // draw bar
  this.context.fillStyle = "#1a242f";
  var x = this.width * percent * 0.999; // scale it 
  this.context.fillRect(x, 0, 2, this.height);
  return _results;
};

Waveform.prototype.clear = function() {
  this.context.fillStyle = this.outerColor;
  this.context.clearRect(0, 0, this.width, this.height);
  return this.context.fillRect(0, 0, this.width, this.height);
};

Waveform.prototype.patchCanvasForIE = function(canvas) {
  var oldGetContext;
  if (typeof window.G_vmlCanvasManager !== "undefined") {
    canvas = window.G_vmlCanvasManager.initElement(canvas);
    oldGetContext = canvas.getContext;
    return canvas.getContext = function(a) {
      var ctx;
      ctx = oldGetContext.apply(canvas, arguments);
      canvas.getContext = oldGetContext;
      return ctx;
    };
  }
};

Waveform.prototype.createCanvas = function(container, width, height) {
  var canvas;
  canvas = document.createElement("canvas");
  container.appendChild(canvas);
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

Waveform.prototype.expandArray = function(data, limit, defaultValue) {
  var i, newData, _i, _ref;
  if (defaultValue == null) {
    defaultValue = 0.0;
  }
  newData = [];
  if (data.length > limit) {
    newData = data.slice(data.length - limit, data.length);
  } else {
    for (i = _i = 0, _ref = limit - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      newData[i] = data[i] || defaultValue;
    }
  }
  return newData;
};

Waveform.prototype.linearInterpolate = function(before, after, atPoint) {
  return before + (after - before) * atPoint;
};

Waveform.prototype.interpolateArray = function(data, fitCount) {
  var after, atPoint, before, i, newData, springFactor, tmp;
  newData = new Array();
  springFactor = new Number((data.length - 1) / (fitCount - 1));
  newData[0] = data[0];
  i = 1;
  while (i < fitCount - 1) {
    tmp = i * springFactor;
    before = new Number(Math.floor(tmp)).toFixed();
    after = new Number(Math.ceil(tmp)).toFixed();
    atPoint = tmp - before;
    newData[i] = this.linearInterpolate(data[before], data[after], atPoint);
    i++;
  }
  newData[fitCount - 1] = data[data.length - 1];
  return newData;
};

module.exports = AudioChannel;
