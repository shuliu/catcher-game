/*eslint no-unused-vars: 0*/
/*eslint ignore: TimelineMax*/

import TweenMax from 'gsap/TweenMax';
import TimelineMax from 'gsap/TimelineMax';
import EasePack from 'gsap';
import Draggable from "gsap/Draggable";

// (function(window){

/** timeline callback */
const timeLineOnStart = () => {
  console.log('timeLineOnStart');
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn.disabled = true;
  resetBtn.disabled = false;
};

const timeLineOnComplete = () => {
  if(!endCallbackLock) {
    console.log('timeLineOnComplete');
    cleanItems();
    removekeyDownEvent();
    mobileStopMove();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    resetBtn.disabled = true;

    endToSendPoint();
    endCallbackLock = true;
  }
  endCallbackLock = false;
};

// 遊戲結束並計算分數
const endToSendPoint = () => {
  console.log('==遊戲結束並計算分數==');
  console.log({
    '得點': score
  });
};

const onComplete = (elem) => { console.log('onComplete');console.log(elem); };
const checkHit = (elem) => {
  // console.log(elem);
  if( Draggable.hitTest(catcher, elem) ) {
    // 碰撞到炸彈
    if(elem.className.indexOf(bombKey) >= 0) {
      // 遊戲停止開始算分
      timeLine.paused(true);
      removekeyDownEvent();
      endToSendPoint();
    }
    // 碰撞到彩球
    else if(elem.className.indexOf(hitKey) === -1) {
      elem.classList.add(hitKey);
      score += parseInt(elem.dataset.point, 10);
      scoreBox.textContent = score.toString();
      TweenMax.killTweensOf(elem);

      let newBoomElem = boomElem.cloneNode();
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
};

/**
 * variables
 */
const gameBox         = document.querySelector('#gameBox');
const orientation     = document.querySelector('#orientation');
const gift            = document.querySelector('.elements .gift');
const catcher         = document.querySelector('#gameBox .catcher');
const scoreBox        = document.querySelector('#score');
const startBtn        = document.querySelector('#startBtn');
const pauseBtn        = document.querySelector('#pauseBtn');
const stopBtn         = document.querySelector('#stopBtn');
const resetBtn        = document.querySelector('#resetBtn');
const MaxPoint        = 20000;
const pointBillList   = [1000, 800, 600, 400, 200];
let   score           = 0;
let   pointList       = [];
const bombKey         = 'bomb'; // 炸彈 class 名稱
const hitKey          = 'hit'; // 碰撞 class 名稱
const hitAnimateTime  = 3; // 碰撞後動畫運作時間 (秒)
const moveWidth       = 40; // 物件含左右搖版寬度
const gameTime        = 30; // 遊戲時間
let   gameStatus      = 'stop'; // 遊戲狀態
const gammaRange      = 5; // 水平儀 gamma 感應角度範圍 (超過才觸發移動)
const moveXWidth      = 80; // 移動距離
const moveXMobile     = 20; // 移動距離 (mobile device orientation)
let   endCallbackLock = true; // timeline 結束 callback 的 lock
let   timeLine        = new TimelineMax({
  delay:0.5,
  onStart: timeLineOnStart,
  onComplete: timeLineOnComplete
});

// 爆炸特效元素
const boomElem = document.createElement('div');
boomElem.classList.add('BoomAnimate');

/**
 * methods
 */

/**
 * 建立禮物並加入時間軸內
 * {number} point 禮物配給的點數面額
 */
const addGift = (point) => {
  let elem = gift.cloneNode();
  elem.dataset.point = point;
  if(point === bombKey) {
    elem.classList.add(bombKey);
  }
  gameBox.append(elem);
  let max = gameBox.clientWidth - moveWidth;
  let randX = random(moveWidth, max);
  let toYMax = gameBox.clientWidth + moveWidth;
  let time = random(2, 4);
  let delay = random(0, gameTime-5);
  // console.log({x: randX, y: 0})
  timeLine.fromTo(elem, time, {x: randX, y: 0}, {
    y: '+=' + max,
    ease: Power0.easeNone,
    onComplete: () => { elem.remove(); },
    onUpdate: () => { checkHit(elem); }
  }, delay);
  return elem;
};

const addBomb = (length) => {
  let time = 0;
  const startTime = 5;
  const endTime = gameTime - startTime;
  for (let index = 0; index < length; index++) {
    time = random(startTime, endTime);
  }
};

/**
 * 亂數分配點數
 * {array} list 發放面額陣列
 * {number} totalPoint 預計發放點數總額
 */
const pointListGenerator = (list, totalPoint) => {
  let allPoints = [];
  let newPoint = 0;

  do {
    newPoint = list[randomRound(0, list.length-1)] || 0;
    if( newPoint > list[0]) {
      list.shift();
      console.log('shift: ' + list);
    }
    if( newPoint <= totalPoint ) {
      totalPoint -= newPoint;
      allPoints.push(newPoint);
    }
  }
  while (totalPoint > 0 );

  return allPoints;
};

/**
 * 取得炸彈總數 (點數彩球數量的 1/10)
 * @param {array} pointList
 * @returns {array}
 */
const bombList = (pointList) => {
  let total = Math.floor(pointList.length/10);
  let bombs = [];
  for (let index = 0; index < total; index++) {
    bombs.push(bombKey);
  }
  return bombs;
};

const onChangeOrientation = (event) => {
  var alpha = event.alpha,
    beta = event.beta,
    gamma = event.gamma;

  var moveData = {
    alpha: Math.round(alpha),
    beta: Math.round(beta),
    gamma: Math.round(gamma)
  };
  if(moveData.gamma > gammaRange) {
    moveCatcherBox(moveXMobile);
  } else if(moveData.gamma < gammaRange) {
    moveCatcherBox(-moveXMobile);
  }

  orientation.innerHTML = JSON.stringify(moveData);
  console.log(moveData);
}

const mobileMove = () => {
  if (window.DeviceOrientationEvent) {
    // console.log('in move');
    // orientation.innerHTML = 'in Move';
    window.addEventListener('deviceorientation', onChangeOrientation, false);
  } else {
    // return false;
    console.log('not support orientation');
    orientation.innerHTML = 'not support orientation';
  }
}

const mobileStopMove = () => {
  if (window.DeviceOrientationEvent) {
    window.removeEventListener('deviceorientation', onChangeOrientation, false);
  }
};

const start = () => {
  timeLine.clear();
  score = 0;
  scoreBox.textContent = score.toString();

  setCatcherToReady();

  let points = shuffle(pointListGenerator(pointBillList, MaxPoint));
  let bombs = bombList(points);
  let mergeList = points.concat(bombs);
  // 重新建立亂數內容 (前10不能是炸彈)
  pointList = mergeList.slice(0, 10).concat(shuffle(mergeList.slice(10)));

  pointList.forEach((v, i) => {
    addGift(v);
  });

  timeLine.play(0);
};

// x秒後移除元素
const removeElem = (elem, time) => {
  let firsttime = true;
  setTimeout(() => {
    if(!firsttime) {
      elem.remove();
    }
    firsttime = false;
  }, time);
};

const cleanItems = (cb) => {

    gameBox.querySelectorAll('.gift').forEach((v, i) => {
      gameBox.removeChild(v);
    });

  if(typeof cb === 'function') cb();
};

/** 設定 catcher 起始位置 */
const setCatcherToReady = () => {
  TweenMax.set(catcher, {
    x: (gameBox.clientWidth / 2 - catcher.clientWidth / 2),
    y: (gameBox.clientHeight - catcher.clientHeight) - 40
  });
};

const keyDownEvent = (event) => {
  if(event.keyCode && event.which === 39) {
    // ->
    moveCatcherBox(moveXWidth);

  }

  if(event.keyCode && event.which === 37) {
    // <-
    moveCatcherBox(-moveXWidth);
  }

};

/**
 * 移動方向
 * movement {number} +- number
 */
const moveCatcherBox = (movement) => {
  if(movement === 0) {
    return false;
  }
  let maxRange = gameBox.clientWidth - catcher.clientWidth; // 最大移動寬距
  let minRange = 0; // 最小移動寬距
  let moveX = 0;
  let time = 0.3;

  if(movement > 0) {
    // ->
    moveX = (catcher._gsTransform.x + movement) > maxRange ? maxRange : catcher._gsTransform.x + movement;
  }
  if(movement < 0) {
    // <-
    moveX = (catcher._gsTransform.x + movement) < minRange ? minRange : catcher._gsTransform.x + movement;
  }

  // console.log({rangX: minRange, on: moveX});
  TweenMax.to(catcher, time, {x: moveX});
};

const addkeyDownEvent = () => {
  console.log('addkeyDownEvent')
  document.addEventListener('keydown', keyDownEvent);
}
const removekeyDownEvent = () => {
  console.log('removekeyDownEvent')
  document.removeEventListener('keydown', keyDownEvent);
}

/** helpers */
const randomRound = (min, max) => (Math.round(Math.random() * (max - min) + min));
const random = (min, max) => (Math.random() * (max - min) + min);
const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
const reducer = (accumulator, currentValue) => (accumulator + currentValue);

/** events method */
const startEvent = () => {
  if( timeLine._time >= timeLine.endTime() || timeLine._time === 0 ) {
    console.log('click to start');
    cleanItems(start);
  } else {
    timeLine.play();
  }
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn.disabled = false;
  resetBtn.disabled = false;
  addkeyDownEvent();
  mobileMove();
};

const pauseEvent = () => {
  timeLine.paused(true);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = false;
  removekeyDownEvent();
  mobileStopMove();
};

const stopEvent = () => {
  timeLine.stop(true);
  cleanItems();
  score = 0;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
  resetBtn.disabled = true;
  removekeyDownEvent();
  mobileStopMove();
};

const resetEvent = () => {
  console.log('click to reset');
  cleanItems(start);
  startBtn.disabled = true;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
  pauseBtn.disabled = false;
  removekeyDownEvent();
  addkeyDownEvent();
  mobileStopMove();
  mobileMove();
};

/**
 * Listener
 */

/** 開始按鈕 */
startBtn.addEventListener('click', startEvent);
startBtn.addEventListener('touchend', startEvent);

/** 暫停 */
pauseBtn.addEventListener('click', pauseEvent);
pauseBtn.addEventListener('touchend', pauseEvent);

/** 暫停 */
stopBtn.addEventListener('click', stopEvent);
stopBtn.addEventListener('touchend', stopEvent);

/** 重啟按鈕 */
resetBtn.addEventListener('click', resetEvent);
resetBtn.addEventListener('touchend', resetEvent);

/**
 * events
 */

startBtn.disabled = false;

/**
 * test code
 */

// catcher.addEventListener('click', () => {
//   setCatcherToReady();
//   addkeyDownEvent();
//   let body = document.body;
//   Draggable.create(catcher, { type:"x", bounds: gameBox});
// });


// })(window);