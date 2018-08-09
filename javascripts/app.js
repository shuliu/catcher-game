/*eslint no-unused-vars: 0*/
/*eslint ignore: TimelineMax*/

// (function(window){

/** timeline callback */
const timeLineOnStart = () => {
  console.log('timeLineOnStart');
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
};

const timeLineOnComplete = () => {
  console.log('timeLineOnComplete');
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = true;
};

const onComplete = (elem) => { console.log('onComplete');console.log(elem); };
const checkHit = (elem) => {
  // console.log(elem);
  if( Draggable.hitTest(catcher, elem) ) {
    // TweenMax.killTweensOf(elem);
    TweenMax.to(elem, 0.5, {backgroundColor: 'green'});
    // console.log(elem);
  }
};

/**
 * variables
 */
const gameBox       = document.querySelector('#gameBox');
const orientation   = document.querySelector('#orientation');
const gift          = document.querySelector('.elements .gift');
const catcher       = document.querySelector('#gameBox .catcher');
const startBtn      = document.querySelector('#startBtn');
const pauseBtn      = document.querySelector('#pauseBtn');
const resetBtn      = document.querySelector('#resetBtn');
const MaxPoint      = 20000;
const pointBillList = [1000, 800, 600, 400, 200];
let   pointList     = [];
const moveWidth     = 40; // 物件含左右搖版寬度
const gameTime      = 60; // 遊戲時間
let   gameStatus    = 'stop'; // 遊戲狀態
let   timeLine      = new TimelineMax({
  delay:0.5,
  onStart: timeLineOnStart,
  onComplete: timeLineOnComplete
});

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
  gameBox.append(elem);
  let max = gameBox.offsetWidth - moveWidth;
  let randX = random(moveWidth, max);
  let toYMax = gameBox.offsetHeight + moveWidth;
  let time = random(2, 4);
  let delay = random(0, gameTime-5);
  console.log({x: randX, y: 0})
  timeLine.fromTo(elem, time, {x: randX, y: 0}, {
    y: '+=' + max,
    ease: Power0.easeNone,
    onComplete: () => { elem.remove(); },
    onUpdate: () => { checkHit(elem); }
  }, delay);
  return elem;
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

const onChangeOrientation = (event) => {
  var alpha = event.alpha,
    beta = event.beta,
    gamma = event.gamma;

  // a.innerHTML = Math.round(alpha);
  // b.innerHTML = Math.round(beta);
  // g.innerHTML = Math.round(gamma);
  var moveData = {
    alpha: Math.round(alpha),
    beta: Math.round(beta),
    gamma: Math.round(gamma)
  };
  orientation.innerHTML = JSON.stringify(moveData);
  console.log(moveData);
}

const move = () => {
  if (window.DeviceOrientationEvent) {
    console.log('in move');
    orientation.innerHTML = 'in Move';
    window.addEventListener('deviceorientation', onChangeOrientation, false);
  } else {
    // return false;
    console.log('not support orientation');
    orientation.innerHTML = 'not support orientation';
  }
}

const start = () => {
  timeLine.clear();
  pointList = shuffle(pointListGenerator(pointBillList, MaxPoint));
  
  // console.log(pointList.reduce(reducer));
  // console.log(pointList);
  
  pointList.forEach((v, i) => {
    addGift(v);
  });

  timeLine.play(0);
};

const cleanItems = (cb) => {

    gameBox.querySelectorAll('.gift').forEach((v, i) => {
      gameBox.removeChild(v);
    });
    
  if(typeof cb === 'function') cb();
}

const keyDownEvent = (event) => {
  if(event.keyCode && event.which === 39) {
    // ->
    TweenMax.to(catcher, 0.2, {x: '+=' + gameBox.offsetWidth/30})
  }

  if(event.keyCode && event.which === 37) {
    // <-
    TweenMax.to(catcher, 0.2, {x: '-=' + gameBox.offsetWidth/30})
  }
  console.log(event);
};
const addkeyDownEvent = () => {
  console.log('addkeyDownEvent')
  document.addEventListener('keydown', keyDownEvent);
}
const removekeyDownEvent = () => {
  console.log(removekeyDownEvent)
  document.removeEventListener('keydown', keyDownEvent);
}

/** helpers */
const randomRound = (min, max) => (Math.round(Math.random() * (max - min) + min));
const random = (min, max) => (Math.random() * (max - min) + min);
const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
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
  resetBtn.disabled = false;
  addkeyDownEvent();
};

const pauseEvent = () => {
  timeLine.paused(true);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  removekeyDownEvent();
};

const resetEvent = () => {
  console.log('click to reset');
  cleanItems(start);
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  removekeyDownEvent();
  addkeyDownEvent()
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

/** 重啟按鈕 */
resetBtn.addEventListener('click', resetEvent);
resetBtn.addEventListener('touchend', resetEvent);

/**
 * events
 */

startBtn.disabled = false;
move();
TweenMax.set(catcher, {
  x: (gameBox.offsetWidth / 2 - catcher.offsetWidth / 2),
  y: (gameBox.offsetHeight - catcher.offsetHeight) - 200
})

// })(window);