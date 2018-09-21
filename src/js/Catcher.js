
import TweenMax from 'gsap/TweenMax';
import TimelineMax from 'gsap/TimelineMax';
import EasePack from 'gsap';
import Draggable from 'gsap/Draggable';
import createElement from './vendor/createElement';
import EventControl from './vendor/EventControl';
HTMLElement.prototype.empty = function() {
  var that = this;
  while (that.hasChildNodes()) {
      that.removeChild(that.lastChild);
  }
};

const randomRound = (min, max) => (Math.round(Math.random() * (max - min) + min));
const random = (min, max) => (Math.random() * (max - min) + min);
const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
const reducer = (accumulator, currentValue) => (accumulator + currentValue);

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
    console.log('[Catcher] Initil');

    /** @var {object} HTMLElements */
    this.elements = new Map();
    /** @var {object} defaultConfig 預設設定 */
    const defaultConfig = {
      container : '#gameBox',
      elements: {
        basket: '#catcher',
        gift: '.gift',
        scoreBoard: '#score-board',
      },
      bombKey: 'bomb', // 炸彈 class 名稱
      hitKey: 'hit', // 碰撞 class 名稱
      total: 20000,
      billList: [1000, 800, 600, 400, 200],
      gameTime: 30, // 遊戲時間
    };
    Object.assign(defaultConfig, configs);

    this.configs = objToStrMap(defaultConfig);
    // console.log(this.configs);

    let thenElements = this.elements;
    this.configs.get('elements').forEach(function(config, key) {
      thenElements.set(key, createElement(config));
    });
    this.gameBoxSelector(this.configs.get('container'));

    this.pointList         = [];     // 禮物及炸彈數量總
    this.score             = 0;      // 積分
    this.bombPercentage    = 0;    // 炸彈數量 (相對於禮物數量的百分比)
    this.hitAnimateTime    = 3;      // 碰撞後動畫運作時間 (秒)
    this.moveWidth         = 40;     // 物件含左右搖版寬度
    this.gameStatus        = 'stop'; // 遊戲狀態
    this.gammaRange        = 5;      // 水平儀 gamma 感應角度範圍 (超過才觸發移動)
    this.moveXWidth        = 80;     // 移動距離
    this.moveXMobile       = 20;     // 移動距離 (mobile device orientation)
    this.startCallbackLock = true;   // timeline 結束 callback 的 lock
    this.endCallbackLock   = true;   // timeline 結束 callback 的 lock

    /** 建立控制事件 */

    // test /////////////////////////////////////////////
    this.addBasket();

    let then = this;
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
      delay:0.5,
      onStart: function() { then.timeLineOnStart(); },
      onComplete: function() { then.timeLineOnComplete(); },
    });

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
   * 產生亂數點數
   * @param {number} total 總點數
   * @param {Map} list 面額陣列
   */
  setPoints(total, list) {
    let allPoints = [];
    let newPoint = 0;
    do {
      newPoint = list.get(randomRound(0, list.size-1) + '') || 0;
      if( newPoint > list[0]) {
        list.shift();
        console.log('shift: ' + list);
      }
      if( newPoint <= total ) {
        total -= newPoint;
        allPoints.push(newPoint);
      }
    } while ( total > 0 );

    return allPoints;
  }

  /**
 * 取得炸彈總數
 * @param {array} pointList
 * @returns {array}
 */
  bombList(pointList) {
    let total = Math.floor(pointList.length * this.bombPercentage);
    let bombs = [];
    for (let index = 0; index < total; index++) {
      bombs.push(this.configs.get('bombKey'));
    }
    return bombs;
  }

  addBasket() {
    let container = this.elements.get('container');
    let basket = this.elements.get('basket');
    container.append(basket);
    let boxSize = document.querySelector(this.configs.get('container'));
    let basketSize = boxSize.querySelector(this.configs.get('basket'));

    TweenMax.set(basket, {
      x: (container.offsetWidth / 2 - basket.offsetWidth / 2),
      y: (container.offsetHeight - basket.offsetHeight) - 40
    });
  }

  /**
   * 建立計分板 & 位置
   */
  addScoreBoard() {
    let container = this.elements.get('container');
    let elem = this.elements.get('scoreBoard');
    elem.textContent = 0;
    container.append(elem);

    TweenMax.set(elem, {
      x: (container.offsetWidth - elem.offsetWidth),
      y: (container.offsetHeight - elem.offsetHeight * 2) -10
    });
  }

  /**
   * 建立禮物並加入時間軸內
   * {number} point 禮物配給的點數面額
   */
 addGift(point, index) {
    // elements
    let container = this.elements.get('container');
    let elem = this.elements.get('gift').cloneNode();
    // keys
    let bombKey = this.configs.get('bombKey');
    let giftKey = this.configs.get('elements').get('gift');
    let gameTime = this.configs.get('gameTime');

    /** 計算落下時間 (等比例) */
    let inlineElem = container.querySelectorAll(giftKey).length || 0; // 已放置數量
    let totalPoint = this.pointList.length;                           // 禮物及炸彈數量
    let maxMoveTime = 3;                                              // 最大落下時間
    let maxTime = gameTime - maxMoveTime;                             // 最大可使用時間 (總遊戲時間 - 最大落下時間)
    let delay = maxTime/totalPoint * (inlineElem + 1);                // 落下時間
    let maxY = container.offsetHeight - this.moveWidth;               // 落下 Y 軸距離 (固定)
    let randX = random(
      this.moveWidth, (container.offsetWidth - this.moveWidth));      // 起始 X 軸位置 (隨機))
    let time = random(1, maxMoveTime);                                // 掉落時間

    elem.dataset.point = point; // 加上點數
    elem.dataset.index = index; // 加上落下順序 (debug 用)
    // 炸彈加上標記
    if(point === bombKey) {
      elem.classList.add(bombKey);
    }

    this.timeLine.fromTo(elem, time, {x: randX, y: 0}, {
      y: '+=' + maxY,
      ease: Power0.easeNone,
      onComplete: () => { elem.remove(); },
      onUpdate: () => { this.checkHit(elem); }
    }, delay);
    container.append(elem);
    return elem;
  }

  /**
   * 碰撞處理
   * @param {Element} elem
   */
  checkHit(elem) {
    let bombKey = this.configs.get('bombKey');
    let hitKey = this.configs.get('hitKey');
    let scoreBoard = this.elements.get('scoreBoard');
    // console.log(elem);
    if( Draggable.hitTest(catcher, elem) ) {
      // 碰撞到炸彈
      if(elem.className.indexOf(bombKey) >= 0) {
        // 遊戲停止開始算分

        // debug 球體落下紀錄
        console.log({
          index: parseInt(elem.dataset.index, 10),
          add: 'boom',
          total: this.score,
        });

        this.timeLine.paused(true);
        this.removekeyDownEvent();
        this.endToSendPoint();
      }
      // 碰撞到彩球
      else if(elem.className.indexOf(hitKey) === -1) {
        elem.classList.add(hitKey);
        this.score += parseInt(elem.dataset.point, 10);
        scoreBoard.textContent = this.score.toString();
        TweenMax.killTweensOf(elem);

        // debug 球體落下紀錄
        console.log({
          index: parseInt(elem.dataset.index, 10),
          add: parseInt(elem.dataset.point, 10),
          total: this.score,
        });

        let newBoomElem = this.elements.get('boom').cloneNode();
        TweenMax.fromTo(newBoomElem, 3, {
          x: elem._gsTransform.x - (elem.offsetWidth/2),
          y: elem._gsTransform.y - (elem.offsetWidth/2),
        },{
          autoAlpha: 0,
        });
        gameBox.append(newBoomElem);

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
    if(event.keyCode && event.which === 39) {
      // ->
      then.moveCatcherBox(then.moveXWidth);

    }
    if(event.keyCode && event.which === 37) {
      // <-
      then.moveCatcherBox(-then.moveXWidth);
    }
  }

  /**
   * 移動方向
   * @param {number} movement
   */
  moveCatcherBox(movement) {
    if(movement === 0) {
      return false;
    }

    let container = this.elements.get('container');
    let basket = this.elements.get('basket');
    let maxRange = container.clientWidth - basket.clientWidth; // 最大移動寬距
    let minRange = 0; // 最小移動寬距
    let moveX = 0;
    let time = 0.3;

    if(movement > 0) {
      // ->
      moveX = (basket._gsTransform.x + movement) > maxRange ? maxRange : basket._gsTransform.x + movement;
    }
    if(movement < 0) {
      // <-
      moveX = (basket._gsTransform.x + movement) < minRange ? minRange : basket._gsTransform.x + movement;
    }

    // console.log({rangX: minRange, on: moveX});
    TweenMax.to(basket, time, {x: moveX});
  }


  onChangeOrientation(event) {
    let alpha = event.alpha,
      beta = event.beta,
      gamma = event.gamma;

    let moveData = {
      alpha: Math.round(alpha),
      beta: Math.round(beta),
      gamma: Math.round(gamma)
    };
    if(moveData.gamma > this.gammaRange) {
      this.moveCatcherBox(this.moveXMobile);
    } else if(moveData.gamma < this.gammaRange) {
      this.moveCatcherBox(-this.moveXMobile);
    }

    // orientation.innerHTML = JSON.stringify(moveData);
    console.log(moveData);
  }

  mobileMove() {
    if (window.DeviceOrientationEvent) {
      let eventMethod = this.onChangeOrientation;
      window.addEventListener('deviceorientation', eventMethod, false);
    } else {
      // return false;
      console.log('not support orientation');
    }
  }

  mobileStopMove(){
    if (window.DeviceOrientationEvent) {
      let eventMethod = this.onChangeOrientation;
      window.removeEventListener('deviceorientation', eventMethod, false);
    }
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

  addkeyDownEvent() {
    console.log('addkeyDownEvent');
    let then = this;
    let eventMethod = function(event) { then.keyDownEvent(event); };
    document.addEventListener('keydown', eventMethod);
  }
  removekeyDownEvent() {
    console.log('removekeyDownEvent');
    let then = this;
    let eventMethod = function(event) { then.keyDownEvent(event); };
    document.removeEventListener('keydown', keyDownEvent);
  }

  /**
   * Control
   */

  startEvent() {
    let then = this;
    if( this.timeLine._time >= this.timeLine.endTime() || this.timeLine._time === 0 ) {
      console.log('click to start');
      this.cleanItems(function() {then.start()});
    } else {
      this.timeLine.play();
    }
    // startBtn.disabled = true;
    // pauseBtn.disabled = false;
    // stopBtn.disabled = false;
    // resetBtn.disabled = false;
    // this.addkeyDownEvent();
    // this.mobileMove();
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

      container.querySelectorAll('.BoomAnimate').forEach((v, i) => {
        container.removeChild(v);
      });

    if(typeof cb === 'function') cb();
  }


  /**
   * timeline callback: start
   */
  timeLineOnStart() {
    if(!this.startCallbackLock) {
      console.log('timeLineOnStart');
      this.startBtn.disabled = true;
      this.pauseBtn.disabled = false;
      this.stopBtn.disabled = true;
      this.resetBtn.disabled = false;

      this.startCallbackLock = true;
    }
    this.startCallbackLock = false;
  }

  /**
   * timeline callback: complete
   */
  timeLineOnComplete() {
    if(!this.endCallbackLock) {
      console.log('timeLineOnComplete');
      this.cleanItems();
      this.eventControl.stop();
      // this.removekeyDownEvent();
      // this.mobileStopMove();
      this.startBtn.disabled = false;
      this.pauseBtn.disabled = true;
      this.stopBtn.disabled = true;
      this.resetBtn.disabled = true;

      this.endToSendPoint();
      this.endCallbackLock = true;
    }
    this.endCallbackLock = false;
  }

  // 遊戲結束並計算分數
  endToSendPoint() {
    console.log('==遊戲結束並計算分數==');
    console.log({
      '得點': this.score
    });
  }


  start() {

    // 清除場上物件
    this.clear();

    // 建立籃子
    let container = this.elements.get('container');
    let basket = this.elements.get('basket');
    container.append(basket);
    this.eventControl.start();
    // this.addBasket();
    // 建立計分板
    this.addScoreBoard();

    // 點數
    let points = shuffle(this.setPoints(this.configs.get('total'), this.configs.get('billList')));
    let bombs = this.bombList(points);
    let mergeList = points.concat(bombs);
    // 重新建立亂數內容 (前10不能是炸彈)
    this.pointList = mergeList.slice(0, 10).concat(shuffle(mergeList.slice(10)));
    this.pointList.forEach((v, i) => this.addGift(v, i));

  }

  /**
   * Initial
   */
  initial() {
    let then = this;

    /** 開始按鈕 */

    this.startBtn.addEventListener('click', function() {then.startEvent();});
    this.startBtn.addEventListener('touchend', function() {then.startEvent();});

    this.startBtn.disabled = false;
  }
}
