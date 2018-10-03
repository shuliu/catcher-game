/**
 * @class Timer
 * @link https://github.com/husa/timer.js/
 */
class Timer {

  /**
   * constructor
   * @param {object} options json object
   */
  constructor(options) {
    this.defaultOptions = {
      tick: 1,
      onstart: null,
      ontick: null,
      onpause: null,
      onstop: null,
      onend: null
    };

    this.myOption = {
      id: +new Date,
      options: {},
      duration: 0,
      status: 'initialized',
      start: 0,
      measures: []
    };

    for (const prop in this.defaultOptions) {
      this.myOption.options[prop] = this.defaultOptions[prop];
      this.options(options);
    }
  }

  /**
   * starts a Timer for a specified time
   * @param {number} duration time of second
   */
  start(duration) {
    if (!+duration && !this.myOption.duration) {
      return this;
    }

    duration && (duration *= 1000);

    if (this.myOption.timeout && this.myOption.status === 'started') {
      return this;
    }

    this.myOption.duration = duration || this.myOption.duration;

    this.myOption.timeout = setTimeout(this.end.bind(this), this.myOption.duration);

    if (typeof this.myOption.options.ontick === 'function') {
      this.myOption.interval = setInterval(function () {
        this.trigger.call(this, 'ontick', this.getDuration());
      }.bind(this), +this.myOption.options.tick * 1000);
    }

    this.myOption.start = +new Date;
    this.myOption.status = 'started';
    this.trigger.call(this, 'onstart', this.getDuration());

    return this;
  }

  /**
   * pause timer
   */
  pause() {
    if (this.myOption.status !== 'started') {
      return this;
    }

    this.myOption.duration -= (+new Date - this.myOption.start);

    this.clear.call(this, false);
    this.myOption.status = 'paused';
    this.trigger.call(this, 'onpause');

    return this;
  }

  /**
   * stop timer doing job
   */
  stop() {
    if (!/started|paused/.test(this.myOption.status)) {
      return this;
    }

    this.clear.call(this, true);
    this.myOption.status = 'stopped';
    this.trigger.call(this, 'onstop');

    return this;
  }

  /**
   * get remaining time (in ms)
   */
  getDuration() {
    if (this.myOption.status === 'started') {
      return this.myOption.duration - (+new Date - this.myOption.start);
    }

    if (this.myOption.status === 'paused') {
      return this.myOption.duration;
    }

    return 0;
  }

  /**
   * get current status of timer. Available statuses are: 'initialized', 'started', 'paused', 'stopped'
   */
  getStatus() {
    return this.myOption.status;
  }

  /**
   * define multiple specific options at once as an object
   * @param {string|object} string option key or json object
   * @param {*} value
   */
  options(option, value) {
    if (option && value) {
      this.myOption.options[option] = value;
    }

    if (!value && typeof option === 'object') {
      for (var prop in option) {
        if (this.myOption.options.hasOwnProperty(prop)) {
          this.myOption.options[prop] = option[prop];
        }
      }
    }

    return this;
  }

  /**
   * set some specific option, support options without 'on' prefix.
   * Available options are : tick, ontick, start, onstart, end, onend, stop, onstop, pause, onpause
   * @param {string} option key string
   * @param {function} value callback function
   */
  on(option, value) {
    if (typeof option !== 'string' || typeof value !== 'function') {
      return this;
    }

    if (!(/^on/).test(option)) {
      option = 'on' + option;
    }

    if (this.myOption.options.hasOwnProperty(option)) {
      this.myOption.options[option] = value;
    }

    return this;
  }

  /**
   * similar to 'on()' but it will remove handler
   * @param {string} option key string
   */
  off(option) {
    if (typeof option !== 'string') {
      return this;
    }

    option = option.toLowerCase();

    if (option === 'all') {
      this.myOption.options = this.defaultOptions;
      return this;
    }

    if (!(/^on/).test(option)) {
      option = 'on' + option;
    }

    if (this.myOption.options.hasOwnProperty(option)) {
      this.myOption.options[option] = this.defaultOptions[option];
    }

    return this;
  }

  /**
   * Start a high-performance measurement with an associated label,
   * you need to use the same label to stop measurement, so make sure you've saved it
   * @param {string} label
   */
  measureStart(label) {
    this.myOption.measures[label || ''] = +new Date;

    return this;
  }

  /**
   * Stop the measument with the associated label, returns the number of elapsed ms
   * @param {string} label
   */
  measureStop(label) {
    return +new Date - this.myOption.measures[label || ''];
  }

  end() {
    this.clear.call(this)
    this.myOption.status = 'stopped';
    this.trigger.call(this, 'onend');
  }

  trigger(event) {
    let callback = this.myOption.options[event],
      args = [].slice.call(arguments, 1);
    typeof callback === 'function' && callback.apply(this, args);
  }

  clear (clearDuration) {
    clearTimeout(this.myOption.timeout)
    clearInterval(this.myOption.interval)
    if (clearDuration === true) {
      this.myOption.duration = 0;
    }
  }

  /**
   * Math function: milliSeconds to seconds
   * @param {number} ms
   * @returns {number} seconds
   */
  msToSec(ms) {
    return parseInt(((ms % 60000) / 1000).toFixed(0), 10);
  }
}



export default Timer;


