import TweenMax from 'gsap/TweenMax';
import TimelineMax from 'gsap/TimelineMax';
import EasePack from 'gsap';
import Draggable from 'gsap/Draggable';
import createElement from './vendor/createElement';
import EventControl from './vendor/EventControl';
// import './vendor/polyfill';
import './vendor/prototype';
import defaultConfigs from './vendor/defaultConfigs';
import helpers from './vendor/helpers';
import Timer from './vendor/Timer';

/**
 * json Object 轉 Map
 * @param {object} obj json object
 * @return {Map} 轉譯後的參數
 */
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    if (typeof obj[k] === 'object') {
      strMap.set(k, objToStrMap(obj[k]));
    } else {
      strMap.set(k, obj[k]);
    }
  }
  return strMap;
}

/**
 * css animation play state
 * @param {Element} elem
 * @param {string} state
 */
function animateState(elem, state = 'running') {
  let defaultState = ['paused', 'running'];
  state = state.toLowerCase();
  if(defaultState.indexOf(state) < 0) {
    return false;
  }

  elem.style.animationPlayState = state;
  return elem;
}

/**
 * 取得 css transform 座標 x, y
 * @param {Element} item
 * @returns {array} [x, y]
 */
function getTranslate(item) {
  var transArr = [];

  if (!window.getComputedStyle) return;
  var style     = getComputedStyle(item),
      transform = style.transform || style.webkitTransform || style.mozTransform || style.msTransform;
  var mat       = transform.match(/^matrix3d\((.+)\)$/);
  if (mat) return parseFloat(mat[1].split(', ')[13]);

  mat = transform.match(/^matrix\((.+)\)$/);
  mat ? transArr.push(parseFloat(mat[1].split(', ')[4])) : transArr.push(0);
  mat ? transArr.push(parseFloat(mat[1].split(', ')[5])) : transArr.push(0);

  return transArr;
}

export class Catcher {

  constructor(configs = {}) {

    // console.log('[Catcher] Initil');
    let then = this;

    this.setConfig(configs);

    this.pointList = []; // 禮物及炸彈數量總
    this.score = 0; // 積分
    this.bombPercentage = [15, 20]; // 炸彈數量 (亂數範圍)
    this.hitAnimateTime = 3; // 碰撞後動畫運作時間 (秒)
    this.goTime = 0; // delay time (累加)
    this.moveWidth = 40; // 物件含左右搖版寬度
    this.gameStatus = 'stop'; // 遊戲狀態
    this.gammaRange = 5; // 水平儀 gamma 感應角度範圍 (超過才觸發移動)
    this.moveXWidth = 80; // 移動距離
    this.moveXMobile = 20; // 移動距離 (mobile device orientation)
    this.startCallbackLock = true; // timeline 結束 callback 的 lock
    this.endCallbackLock = true; // timeline 結束 callback 的 lock

    this.timer = new Timer({
      tick    : 1,
      ontick  : function(ms) {
        let sec = this.msToSec(ms);
        let elem = then.elements.get('timerBoard');
        elem.textContent = sec;
      },
      onstart : function() {
        console.log('timer started');
        let elem = then.elements.get('timerBoard');
        let gameTime = then.configs.get('gameTime').toString();

        if(elem.textContent === '') {
          elem.textContent = gameTime;
        }
      },
      onstop  : () => { console.log('timer stop') },
      onpause : () => { console.log('timer set on pause') },
      onend   : function() {
        let elem = then.elements.get('timerBoard');
        elem.textContent = 0;
        console.log('timer ended normally')
      }
    });

    // 設定初始分數
    this.elements.get('scoreBoard').textContent = 0;
    // 設定初始時間
    this.elements.get('timerBoard').textContent = this.configs.get('gametime');

    /** 建立控制事件 */

    // test /////////////////////////////////////////////
    this.addBasket();

    this.eventControl = new EventControl(
      this.elements.get('container'),
      this.elements.get('basket'),
    );
    // test end /////////////////////////////////////////

    this.startBtn = document.querySelector('#startBtn');
    this.pauseBtn = document.querySelector('#pauseBtn');
    this.stopBtn = document.querySelector('#stopBtn');
    this.resetBtn = document.querySelector('#resetBtn');


    this.timeLine = new TimelineMax({
      delay: 0.5,
      onStart: function () {
        then.timeLineOnStart();
      },
      onComplete: function () {
        then.timeLineOnComplete();
      },
    });

    this.initial();
  }

  /**
   * 設定 configs
   * @param {object} configs
   */
  setConfig(configs = {}) {
    /** @var {object} HTMLElements */
    this.elements = new Map();

    Object.assign(defaultConfigs, configs);

    this.configs = null;
    this.configs = objToStrMap(defaultConfigs);
    // console.log(this.configs);

    let thenElements = this.elements;
    this.configs.get('elements').forEach((config, key) => {
      let elem = createElement(config);
      thenElements.set(key, elem);
    });

    // 設定遊戲主框
    this.gameBoxMapping('container', this.configs.get('container'));

    // 設定計分板
    this.gameBoxMapping('scoreBoard', this.configs.get('scoreBoard'));

    // 設定計分板
    this.gameBoxMapping('timerBoard', this.configs.get('timerBoard'));


  }

  /**
   * 遊戲框架設定
   * @param {string} mapping element select key
   * @param {string} domString
   */
  gameBoxMapping(key, domString = '') {
    let elem = document.querySelector(domString);

    /** 若無法搜尋到主框時自動建立並插入 body 最底下 */
    if (elem === null) {
      elem = createElement(domString);
      document.body.appendChild(elem);
    }
    this.elements.set(key, elem);
  }

  /**
   * 產生亂數點數
   * @param {number} total 總點數
   * @param {Map} list 面額陣列
   * @returns {array} point list
   */
  setPoints(total, list) {
    let allPoints = [];
    let newPoint = 0;
    do {
      newPoint = list.get(helpers.randomRound(0, list.size - 1) + '') || 0;
      if (newPoint > list[0]) {
        list.shift();
        // console.log('shift: ' + list);
      }
      if (newPoint <= total) {
        total -= newPoint;
        allPoints.push(newPoint);
      }
    } while (total > 0);

    return allPoints;
  }

  /**
   * 取得炸彈總數
   * @param {array} pointList
   * @returns {array} bombs list
   */
  bombList(pointList) {
    // let total = Math.floor(pointList.length * this.bombPercentage);
    let total = helpers.randomRound(this.bombPercentage[0], this.bombPercentage[1]);
    let bombs = [];
    for (let index = 0; index < total; index++) {
      bombs.push(this.configs.get('bombKey'));
    }
    return bombs;
  }

  /**
   * 建立接球控制 bar
   */
  addBasket() {
    let container = this.elements.get('container');
    let basket = this.elements.get('basket');
    let sensingArea = this.elements.get('sensingArea');
    basket.appendChild(sensingArea);
    container.appendChild(basket);
    let boxSize = document.querySelector(this.configs.get('container'));
    let basketSize = boxSize.querySelector(this.configs.get('basket'));

    basket.style.display = 'none';

    // TweenMax.set(basket, {
    //   x: (container.offsetWidth / 2 - basket.offsetWidth / 2),
    //   y: (container.offsetHeight - basket.offsetHeight)
    // });
  }

  /**
   * 增加爆炸效果容器
   */
  addExplosion() {
    // 預置爆破元件容器
    this.elements.get('basket').appendChild(this.elements.get('explosion'));
  }

  /**
   * 建立計分板 & 位置
   */
  addScoreBoard() {
    let container = this.elements.get('container');
    let elem = this.elements.get('scoreBoard');
    // elem.textContent = 0;
    // container.appendChild(elem);

    TweenMax.set(elem, {
      x: (container.offsetWidth - elem.offsetWidth),
      y: (container.offsetHeight - elem.offsetHeight * 2) - 10
    });
  }

  /**
   * 建立禮物並加入時間軸內
   * @param {number} point 禮物配給的點數面額
   */
  addGift(point, index) {
    // elements
    let container = this.elements.get('container');
    let elem = this.elements.get('gift').cloneNode();

    // keys
    let bombKey = this.configs.get('bombKey');
    let giftKey = this.configs.get('elements').get('gift');
    let gameTime = this.configs.get('gameTime');
    // 非炸彈類加入彩球
    if (point !== bombKey) {
      let colors = this.configs.get('giftColors');
      let ballColor = createElement(colors.get(helpers.randomRound(0, colors.size - 1) + ''));
      elem.appendChild(ballColor);
    }

    /** 計算落下時間 (等比例) */
    let inlineElem = container.querySelectorAll(giftKey).length || 0; // 已放置數量
    let totalPoint = this.pointList.length;                           // 禮物及炸彈數量
    let maxMoveTime = 4;                                              // 最大落下時間
    let maxTime = gameTime - maxMoveTime;            // 最大可使用時間 (總遊戲時間 - 最大落下時間)
    let defY = -80;                                                   // 起始掉落 Y 軸
    let maxY = container.offsetHeight - this.moveWidth - defY;        // 落下 Y 軸距離 (固定)
    let randX = helpers.random(
      this.moveWidth, (container.offsetWidth - this.moveWidth));      // 起始 X 軸位置 (隨機))

    let baseAddTime = 3.4;
    let total = this.pointList.length - 1;

    // 前 1/3 加量
    if(index / total < 0.3) {
      baseAddTime = 2.8;

    // 中段 2/3
    } else if(index / total < 0.6) {
      baseAddTime = 3.1;
    }

    let time = helpers.random(3, maxMoveTime);                        // 掉落時間
    let delay = this.goTime === 0
      ? this.goTime
      : this.goTime + time / baseAddTime; // 落下時間
    this.goTime += time / baseAddTime;
    // elem.dataset.point = point;                                       // 加上點數
    elem.setAttribute('data-point', point);
    elem.setAttribute('data-index', index);
    // elem.dataset.index = index;                                       // 加上落下順序 (debug 用)

    if( delay > maxTime ) {
      // console.log('overload')
      delay = maxTime - maxMoveTime;
      this.goTime = helpers.random(6, maxTime*0.3);

      // debug
      // elem.style.border='5px solid yellow';
    }
    if(total === index) {
      // console.log('最後');
      time = 3;
      delay = 27;

    }

    // 炸彈加上標記
    if (point === bombKey) {
      elem.classList.add(bombKey);
    }

    this.timeLine.fromTo(elem, time, {x: randX, y: defY}, {
      y: '+=' + maxY,
      ease: Power0.easeNone,
      onComplete: () => { elem.remove(); },
      onUpdate: () => { this.checkHit(elem); },
    }, `${delay}`);
    container.appendChild(elem);
  }

  /**
   * 碰撞處理
   * @param {Element} elem
   */
  checkHit(elem) {
    let bombKey = this.configs.get('bombKey');
    let hitKey = this.configs.get('hitKey');
    let scoreBoard = this.elements.get('scoreBoard');
    let catcher = this.eventControl.ControlElementDTO.element;
    let sensingArea = this.elements.get('sensingArea');
    // console.log(elem);
    if (Draggable.hitTest(sensingArea, elem)) {
      // 碰撞到炸彈
      if (elem.className.indexOf(bombKey) >= 0) {
        // 遊戲停止開始算分
        this.timer.pause();
        catcher.classList.add('dark');

        let explosion = this.elements.get('explosion');
        let area = getTranslate(catcher);
        let explosionLocation = {
          x: -70, // area[0] - 50,
          y: -300, //area[1] - 100,
          scale: 2,
        };

        TweenMax.set(explosion, explosionLocation);
        explosion.classList.add(this.configs.get('explosion'));

        Draggable.get(catcher).disable();

        this.timeLine.paused(true);
        this.endToSendPoint();
      }

      // 碰撞到彩球
      else if (elem.className.indexOf(hitKey) === -1) {

        // 計分
        this.score += parseInt(elem.getAttribute('data-point'), 10);
        scoreBoard.textContent = this.score.toString();

        // tween kill
        TweenMax.killTweensOf(elem);

        // 人物特效
        catcher.classList.add('happy');
        setTimeout(function() {
          catcher.classList.remove('happy');
        }, 600);

        // 彩球特效
        elem.classList.add(hitKey);
        let newBoomElem = this.elements.get('boom').cloneNode();
        TweenMax.fromTo(newBoomElem, 3, {
          x: elem._gsTransform.x - (elem.offsetWidth / 2),
          y: elem._gsTransform.y - (elem.offsetWidth / 2),
        }, {
          autoAlpha: 0,
        });
        gameBox.appendChild(newBoomElem);

        // 移除彩球
        elem.remove();
      }
    }
  }

  /**
   * 移動事件
   * @param {event} event
   */
  keyDownEvent(event) {
    let then = this;
    if (event.keyCode && event.which === 39) {
      // ->
      then.moveCatcherBox(then.moveXWidth);

    }
    if (event.keyCode && event.which === 37) {
      // <-
      then.moveCatcherBox(-then.moveXWidth);
    }
  }

  /**
   * 移動方向
   * @param {number} movement
   */
  moveCatcherBox(movement) {
    if (movement === 0) {
      return false;
    }

    let container = this.elements.get('container');
    let basket = this.elements.get('basket');
    let maxRange = container.clientWidth - basket.clientWidth; // 最大移動寬距
    let minRange = 0; // 最小移動寬距
    let moveX = 0;
    let time = 0.3;

    if (movement > 0) {
      // ->
      moveX = (basket._gsTransform.x + movement) > maxRange ? maxRange : basket._gsTransform.x + movement;
    }
    if (movement < 0) {
      // <-
      moveX = (basket._gsTransform.x + movement) < minRange ? minRange : basket._gsTransform.x + movement;
    }

    // console.log({rangX: minRange, on: moveX});
    TweenMax.to(basket, time, {
      x: moveX
    });
  }

  /**
   * Events
   */
  /** 開始 */
  setStartEvent(elem) {
    let then = this;
    elem.addEventListener('click', function () {
      then.startEvent();
    });
    elem.addEventListener('touchend', function () {
      then.startEvent();
    });
  }

  /** 暫停 */
  setPauseEvent(elem) {

    let then = this;
    elem.addEventListener('click', function () {
      then.pause();
    });
    elem.addEventListener('touchend', function () {
      then.pause();
    });
  }

  /** 暫停 */
  setPauseEvent(elem) {
    let then = this;
    elem.addEventListener('click', function() {
      then.pause();
    });
    elem.addEventListener('touchend', function() {
      then.pause();
    });
  }

  /** 停止 */
  setStopEvent(elem) {
    let then = this;
    elem.addEventListener('click', function() {
      then.stop();
    });
    elem.addEventListener('touchend', function() {
      then.stop();
    });
  }
  /** 重啟 */
  // setResetEvent(elem) {
  //   let then = this;
  //   elem.addEventListener('click', function() {
  //     then.reset();
  //   });
  //   elem.addEventListener('touchend', function() {
  //     then.reset();
  //   });
  // }

  // addkeyDownEvent() {
  //   // console.log('addkeyDownEvent');
  //   let then = this;
  //   let eventMethod = function (event) {
  //     then.keyDownEvent(event);
  //   };
  //   document.addEventListener('keydown', eventMethod);
  // }

  /**
   * Control
   */

  startEvent() {
    let then = this;

    then.startBtn.disabled = true;
    then.pauseBtn.disabled = false;
    // then.stopBtn.disabled  = false;
    // then.resetBtn.disabled = false;

    if (this.timeLine._time >= this.timeLine.endTime() || this.timeLine._time === 0) {
      // console.log('click to start');
      this.cleanItems(function () {
        then.start();
        then.timer.start(then.configs.get('gameTime'));
      });
    } else {
      this.timeLine.play();
      let time = then.elements.get('timerBoard').textContent || then.configs.get('gameTime');
      then.timer.start(time);
    }
  }

  start() {

    // 清除場上物件
    this.clear();
    this.timeLine.clear();

    // 建立籃子
    let container = this.elements.get('container');
    let basket = this.elements.get('basket');
    // 爆炸效果容器
    this.addExplosion();

    container.appendChild(basket);
    this.eventControl.start();
    // this.addBasket();
    // 建立計分板
    // this.addScoreBoard();

    // 點數
    let points = helpers.shuffle(this.setPoints(
      this.configs.get('total'),
      this.configs.get('billList')
    ));
    let bombs = this.bombList(points);
    let mergeList = points.concat(bombs);

    // 數量 > 10 才排序前 10 不給炸彈
    if (points.length > 10) {
      // 重新建立亂數內容 (前10不能是炸彈)
      this.pointList = mergeList.slice(0, 10).concat(helpers.shuffle(mergeList.slice(10)));
    } else {
      this.pointList = mergeList.concat(helpers.shuffle(mergeList));
    }

    console.log(this.pointList);
    console.log({
      '總數': this.pointList.length,
      '彩球': points.length,
      '炸彈': bombs.length
    });

    this.pointList.forEach((v, i) => this.addGift(v, i));

  }

  pause() {
    // console.log('pause control');

    this.timeLine.paused(true);
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.timer.pause();
    // this.stopBtn.disabled  = false;
    // this.resetBtn.disabled = false;
  }
  stop() {
    // console.log('stop control');
    // this.timeLine.stop(true);
    // this.cleanItems();
    // this.score = 0;
    // this.startBtn.disabled = false;
    // this.pauseBtn.disabled = true;
    // this.stopBtn.disabled = true;
    // this.resetBtn.disabled = true;
  }
  reset() {
    // console.log('reset control');
    // let then = this;
    // this.pointList = [];
    // this.cleanItems(function() {then.start()});
    // this.startBtn.disabled = true;
    // this.pauseBtn.disabled = false;
    // this.stopBtn.disabled = true;
    // this.resetBtn.disabled = true;
  }

  empty(elem) {
    while (elem.hasChildNodes()) {
      elem.removeChild(elem.lastChild);
    }
  }

  clear() {
    this.elements.get('container').empty();
  }

  /**
   * 清除彩球及炸彈
   * @param {*} cb callback
   */
  cleanItems(cb) {
    let container = this.elements.get('container');
    container.querySelectorAll('.gift').forEach((v, i) => {
      container.removeChild(v);
    });

    container.querySelectorAll(this.configs.get('boom')).forEach((v, i) => {
      container.removeChild(v);
    });

    if (typeof cb === 'function') cb();
  }


  /**
   * timeline callback: start
   */
  timeLineOnStart() {
    if (!this.startCallbackLock) {
      // console.log('timeLineOnStart');
      this.startBtn.disabled = true;
      this.pauseBtn.disabled = false;
      // this.stopBtn.disabled = false;
      // this.resetBtn.disabled = false;

      this.startCallbackLock = true;
    }
    this.startCallbackLock = false;
  }

  /**
   * timeline callback: complete
   */
  timeLineOnComplete() {
    if (!this.endCallbackLock) {
      // console.log('timeLineOnComplete');
      this.cleanItems();
      this.eventControl.stop();

      this.endToSendPoint();
      this.endCallbackLock = true;
    }
    this.endCallbackLock = false;
  }

  // 遊戲結束並計算分數
  endToSendPoint() {
    // console.log('==遊戲結束並計算分數==');
    // console.log({
    //   '得點': this.score
    // });

    let container = this.elements.get('container');
    let basket = this.elements.get('basket');
    let gifts = container.querySelectorAll(this.configs.get('elements').get('gift'));

    /** 球停止滾動 css animation */
    gifts.forEach((item, key) => {
      if(item.children.length > 0) {
        animateState(item.children[0], 'paused');
      }
    });
    /** 人物停止 css animation */
    // animateState(basket, 'paused');

    this.startBtn.disabled = true;
    this.pauseBtn.disabled = true;
    // this.stopBtn.disabled = true;
    // this.resetBtn.disabled = true;
    this.configs.get('endCallback')(this.score);
  }

  /**
   * Initial
   */
  initial() {

    /** 開始按鈕 */
    this.setStartEvent(this.startBtn);
    this.setPauseEvent(this.pauseBtn);
    // this.setStopEvent(this.stopBtn);
    // this.setResetEvent(this.resetBtn);

    this.startBtn.disabled = false;
  }
}
