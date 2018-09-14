
import TweenMax from 'gsap/TweenMax';
import TimelineMax from 'gsap/TimelineMax';
import EasePack from 'gsap';
import Draggable from 'gsap/Draggable';
import createElement from './vendor/createElement';

HTMLElement.prototype.empty = function() {
  var that = this;
  while (that.hasChildNodes()) {
      that.removeChild(that.lastChild);
  }
};

/**
 * json Object 轉 Map
 * @param {object} obj json object
 * @return {Map} 轉譯後的參數
 */
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    if(typeof obj[k] === 'object') {
      strMap.set(k, objToStrMap(obj[k]));
    } else {
      strMap.set(k, obj[k]);
    }
  }
  return strMap;
}

export class Catcher {

  constructor(configs = {}) {
    console.log('Catcher Initil');

    /** @var {object} HTMLElements */
    this.elements = new Map();
    /** @var {object} defaultConfig 預設設定 */
    const defaultConfig = {
      container : '#gameBox',
      elements: {
        basket: '#catcher',
        gift: '.gift',
        scoreBoard: '#score-board',
      }
    };
    Object.assign(defaultConfig, configs);

    this.configs = objToStrMap(defaultConfig);

    let thenElements = this.elements;
    this.configs.get('elements').forEach(function(config, key) {
      thenElements.set(key, createElement(config));
    });
    this.gameBoxSelector(this.configs.get('container'));

    this.initial();
  }

  gameBoxSelector(domString = '') {
    let elem = document.querySelector(domString);

    /** 若無法搜尋到主框時自動建立並插入 body 最底下 */
    if(elem === null) {
      elem = createElement(domString);
      document.body.append(elem);
    }
     this.elements.set('container', elem);
  }

  /**
   * Events
   */
  /** 開始 */
  setStartEvent(elem) {
    elem.addEventListener('click', this.start);
    elem.addEventListener('touchend', this.start);
  }
  /** 暫停 */
  setPauseEvent(elem) {
    elem.addEventListener('click', this.pause);
    elem.addEventListener('touchend', this.pause);
  }
  /** 停止 */
  setStopEvent(elem) {
    elem.addEventListener('click', this.stop);
    elem.addEventListener('touchend', this.stop);
  }
  /** 重啟 */
  setResetEvent(elem) {
    elem.addEventListener('click', this.reset);
    elem.addEventListener('touchend', this.reset);
  }

  /**
   * Control
   */

  start() {
    console.log('start control');
  }
  pause() {
    console.log('pause control');
  }
  stop() {
    console.log('stop control');
  }
  reset() {
    console.log('reset control');
  }

  empty(elem) {
    while (elem.hasChildNodes()) {
        elem.removeChild(elem.lastChild);
    }
  }

  clear() {
    // this.empty(this.elements.container);
    this.elements.get('container').empty();
  }

  /**
   * Initial
   */
  initial() {
    // 建立場上物件

    /** test console */
    this.elements.forEach(element => {
      console.log(element);
    });


    this.clear();
  }
}
