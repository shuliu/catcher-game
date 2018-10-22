import TimelineLite from 'gsap/TimelineLite';
import {
  TweenLite,
  Power0
} from 'gsap/TweenLite';
import Draggable from 'gsap/Draggable';

import CubicBezier from './vendor/CubicBezier';
import createElement from './vendor/createElement';
import EventControl from './vendor/EventControl';
// import './vendor/polyfill';
import './vendor/prototype';
import defaultConfigs from './vendor/defaultConfigs';
import helpers from './vendor/helpers';
import Timer from './vendor/Timer';

export class Catcher {

  constructor(configs = {}) {
    let then = this;

    this.setConfig(configs);

    this.baseConfig = {
      pointList: [], // 禮物及炸彈數量總
      score: 0, // 積分
      bomb: {
        limit: [15, 20], // 炸彈數量 (亂數範圍)
        first: 5, // 炸彈起始位置
      },
      goTime: 0, // delay time (累加)
      move: {
        width: 40, // 物件含左右搖版寬度
      },
      moveX: {
        width: 80, // 移動距離
        mobile: 20, // 移動距離 (mobile device orientation)
      },
      lock: {
        startCallback: true, // timeline 結束 callback 的 lock
        endCallback: true, // timeline 結束 callback 的 lock
      },
      // gameStatus: 'stop', // 遊戲狀態
      // gammaRange: 5, // 水平儀 gamma 感應角度範圍 (超過才觸發移動)
    };

    /** @var {object} timer 計時器 */
    this.timer = new Timer({
      tick: 1,
      ontick: function (ms) {
        let sec = this.msToSec(ms);
        let elem = then.elements.get('timerBoard');
        elem.textContent = sec;
      },
      onstart: function () {
        let elem = then.elements.get('timerBoard');
        let gameTime = then.configs.get('gameTime').toString();

        if (elem.textContent === '') {
          elem.textContent = gameTime;
        }
      },
      onend: function () {
        let elem = then.elements.get('timerBoard');
        elem.textContent = 0;
      }
    });

    // 設定初始分數
    this.elements.get('scoreBoard').textContent = 0;
    // 設定初始時間
    this.elements.get('timerBoard').textContent = this.configs.get('gameTime');

    /** 建立控制事件 */

    this.addBasket();

    this.eventControl = new EventControl(
      this.elements.get('container'),
      this.elements.get('basket'),
    );
    // test end /////////////////////////////////////////

    this.startBtn = document.querySelector(this.configs.get('startBtn'));

    this.timeLine = new TimelineLite({
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
    this.configs = helpers.objToStrMap(defaultConfigs);

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
    let total = helpers.randomRound(this.baseConfig.bomb.limit[0], this.baseConfig.bomb.limit[1]);
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
    // let boxSize = document.querySelector(this.configs.get('container'));
    // let basketSize = boxSize.querySelector(this.configs.get('basket'));
    basket.style.display = 'none';
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

    TweenLite.set(elem, {
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
    let maxMoveTime = 3; // 最大落下時間
    let maxTime = gameTime - maxMoveTime; // 最大可使用時間 (總遊戲時間 - 最大落下時間)
    let defY = -this.baseConfig.moveX.width; // 起始掉落 Y 軸
    let maxY = container.offsetHeight - this.baseConfig.move.width - defY; // 落下 Y 軸距離 (固定)
    let randX = helpers.random(
      this.baseConfig.move.width, (container.offsetWidth - this.baseConfig.move.width)); // 起始 X 軸位置 (隨機))

    let baseAddTime = 3.4;
    let total = this.baseConfig.pointList.length - 1;

    // 前 1/3 加量
    if (index / total < 0.3) {
      baseAddTime = 2.8;

      // 中段 2/3
    } else if (index / total < 0.6) {
      baseAddTime = 3.1;
    }

    let time = helpers.random(2, maxMoveTime); // 掉落時間
    let delay = this.baseConfig.goTime === 0 ?
      this.baseConfig.goTime :
      this.baseConfig.goTime + time / baseAddTime; // 落下時間
    this.baseConfig.goTime += time / baseAddTime;
    elem.setAttribute('data-point', point);
    elem.setAttribute('data-index', index);

    if (delay > maxTime) {
      delay = maxTime - maxMoveTime;
      this.baseConfig.goTime = helpers.random(6, maxTime * 0.3);

    }
    if (total === index) {
      time = 3;
      delay = this.configs.get('gameTime') - time;
    }

    // 炸彈加上標記
    if (point === bombKey) {
      elem.classList.add(bombKey);
    }

    this.timeLine.fromTo(elem, time, {
      x: randX,
      y: defY
    }, {
      y: '+=' + maxY,
      ease: Power0.easeNone,
      onComplete: () => {
        elem.remove();
      },
      onUpdate: () => {
        this.checkHit(elem);
      },
    }, delay);
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
    let moveXWitdh = this.baseConfig.moveX.width;

    if (Draggable.hitTest(sensingArea, elem)) {
      // 碰撞到炸彈
      if (elem.className.indexOf(bombKey) >= 0) {
        // 遊戲停止開始算分
        this.timer.pause();
        catcher.classList.add('dark');

        let explosion = this.elements.get('explosion');
        let area = helpers.getTranslate(catcher);
        let explosionLocation = {
          x: -70,
          y: -300,
          scale: 2,
        };

        TweenLite.set(explosion, explosionLocation);
        explosion.classList.add(this.configs.get('explosion'));

        Draggable.get(catcher).disable();

        this.timeLine.paused(true);
        this.endToSendPoint();
      }

      // 碰撞到彩球
      else if (elem.className.indexOf(hitKey) === -1) {

        // 計分
        let point = parseInt(elem.getAttribute('data-point'), 10);
        this.baseConfig.score += point;
        scoreBoard.textContent = this.baseConfig.score.toString();

        // tween kill
        TweenLite.killTweensOf(elem);

        // 人物特效
        catcher.classList.add('happy');
        setTimeout(function () {
          catcher.classList.remove('happy');
        }, 600);

        // 彩球特效
        elem.classList.add(hitKey);

        // popup 分數元件
        let newBonusElem = this.genBonusElement(point);

        let location = {
          x: elem._gsTransform.x - (elem.offsetWidth / 2),
          y: elem._gsTransform.y - (elem.offsetWidth / 2),
        };

        TweenLite.fromTo(newBonusElem, 1.3, location, {
          y: `-=${moveXWitdh}`,
          ease: CubicBezier.config(0, .88, .79, .92),
          onComplete: () => {
            newBonusElem.remove();
          },
        });
        gameBox.appendChild(newBonusElem);

        // 移除彩球
        elem.remove();
      }
    }
  }

  // /**
  //  * 移動方向
  //  * @param {number} movement
  //  */
  // moveCatcherBox(movement) {
  //   if (movement === 0) {
  //     return false;
  //   }

  //   let container = this.elements.get('container');
  //   let basket = this.elements.get('basket');
  //   let maxRange = container.clientWidth - basket.clientWidth; // 最大移動寬距
  //   let minRange = 0; // 最小移動寬距
  //   let moveX = 0;
  //   let time = 0.3;

  //   if (movement > 0) {
  //     // ->
  //     moveX = (basket._gsTransform.x + movement) > maxRange ? maxRange : basket._gsTransform.x + movement;
  //   }
  //   if (movement < 0) {
  //     // <-
  //     moveX = (basket._gsTransform.x + movement) < minRange ? minRange : basket._gsTransform.x + movement;
  //   }

  //   // console.log({rangX: minRange, on: moveX});
  //   TweenLite.to(basket, time, {
  //     x: moveX
  //   });
  // }

  /**
   * 建立 popup 分數元件
   * @param {number} point 點數
   * @returns {Element} popup 分數元件
   */
  genBonusElement(point) {
    let bonus = createElement('div');
    let firstTxt = createElement('span.bonus-txt');
    let lastTxt = firstTxt.cloneNode();
    let pointTxt = document.createTextNode(point);
    bonus.classList.add('bonus');
    firstTxt.textContent = '+';
    lastTxt.textContent = '點';
    bonus.appendChild(firstTxt);
    bonus.appendChild(pointTxt);
    bonus.appendChild(lastTxt);
    return bonus;
  }

  /**
   * Events
   */
  /** 開始 */
  // setStartEvent(elem) {
  //   let then = this;
  //   elem.addEventListener('click', function () {
  //     then.startEvent();
  //   });
  //   elem.addEventListener('touchend', function () {
  //     then.startEvent();
  //   });
  // }

  /**
   * Control
   */

  startEvent() {
    let then = this;

    // then.startBtn.disabled = true;

    if (this.timeLine._time >= this.timeLine.endTime() || this.timeLine._time === 0) {
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

    // 點數
    let points = helpers.shuffle(this.setPoints(
      this.configs.get('total'),
      this.configs.get('billList')
    ));
    let bombs = this.bombList(points);
    let mergeList = points.concat(bombs);

    // 數量 > this.bomb.first 才排序前 this.bomb.first 不給炸彈
    if (points.length > this.baseConfig.bomb.first) {
      // 重新建立亂數內容 (前 this.bomb.first 不能是炸彈)
      this.baseConfig.pointList = mergeList.slice(0, this.baseConfig.bomb.first)
        .concat(helpers.shuffle(mergeList.slice(this.baseConfig.bomb.first)));
    } else {
      this.baseConfig.pointList = mergeList.concat(helpers.shuffle(mergeList));
    }

    // console.log(this.pointList);
    // console.log({
    //   '總數': this.pointList.length,
    //   '彩球': points.length,
    //   '炸彈': bombs.length
    // });

    this.baseConfig.pointList.forEach((v, i) => this.addGift(v, i));


    this.configs.get('startCallback')();

  }

  /**
   * 觸發開始遊戲
   */
  play() {
    this.startEvent();
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
    if (!this.baseConfig.lock.startCallback) {
      // this.startBtn.disabled = true;
      this.baseConfig.lock.startCallback = true;
    }
    this.baseConfig.lock.startCallback = false;
    this.baseConfig.lock.endCallback = false;
  }

  /**
   * timeline callback: complete
   */
  timeLineOnComplete() {
    if (!this.baseConfig.lock.endCallback) {
      this.cleanItems();
      this.eventControl.stop();

      this.endToSendPoint();
      this.baseConfig.lock.endCallback = true;
    }
    this.baseConfig.lock.endCallback = false;
  }

  // 遊戲結束並計算分數
  endToSendPoint() {
    let container = this.elements.get('container');
    let basket = this.elements.get('basket');
    let gifts = container.querySelectorAll(this.configs.get('elements').get('gift'));
    let time = Math.round(this.timer.getDuration() / 1000);

    /** 球停止滾動 css animation */
    gifts.forEach((item, key) => {
      if (item.children.length > 0) {
        helpers.animateState(item.children[0], 'paused');
      }
    });

    this.configs.get('endCallback')(this.baseConfig.score, time);
  }

  /**
   * Initial
   */
  initial() {
    // 展開開始畫面
    this.configs.get('initialCallback')();
  }
}