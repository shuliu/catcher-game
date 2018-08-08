/*eslint no-unused-vars: 0*/
/*eslint ignore: TimelineMax*/

/**
 * variables
 */
const gameBox       = document.querySelector('#gameBox');
const gift          = document.querySelector('.elements .gift');
const resetBtn      = document.querySelector('#reset');
const MaxPoint      = 20000;
const pointBillList = [1000, 800, 600, 400, 200];
let   pointList     = [];
const moveWidth     = 40; // 物件含左右搖版寬度
const gameTime      = 60; // 遊戲時間
let   timeLine      = new TimelineMax({delay:0.5});

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
  timeLine.fromTo(elem, time, {x: randX}, {
    y: '+=500',
    ease: Power0.easeNone,
    onComplete: () => { elem.remove(); },
  }, delay)
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

const start = () => {
  timeLine.clear();
  pointList = shuffle(pointListGenerator(pointBillList, MaxPoint));
  
  // console.log(pointList.reduce(reducer));
  // console.log(pointList);
  
  pointList.forEach((v, i) => {
    addGift(v);
  });
}

/** timeline callback */
const onComplete = (elem) => { console.log('onComplete');console.log(elem); }

/** helpers */
const randomRound = (min, max) => (Math.round(Math.random() * (max - min) + min));
const random = (min, max) => (Math.random() * (max - min) + min);
const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
const reducer = (accumulator, currentValue) => (accumulator + currentValue);

/**
 * Listener
 */

/** 重啟按鈕 */
resetBtn.addEventListener('click', () => {
  console.log('click to reset');
  while (gameBox.firstChild) {
    gameBox.removeChild(gameBox.firstChild);
  }
  start();
  // gameBox
});

/**
 * events
 */

start();


