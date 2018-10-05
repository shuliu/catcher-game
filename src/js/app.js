/*eslint no-unused-vars: 0*/
/*eslint ignore: TimelineMax*/

import { Catcher as CatcherGame } from './Catcher.js';

document.addEventListener("DOMContentLoaded", () => {

  const gameConfig = {
    container: '#gameBox',      // 遊戲框
    scoreBoard: '#score-board', // 計分板
    timerBoard: '#timer-board', // 倒數計時板
    startBtn: '#js-start-btn',  // 綁定開始按鈕
    giftColors: ['.ball', '.ball_2', '.ball_3', '.ball_4', '.ball_5',],
    elements: {
      gift: '.gift',              // 彩球
      sensingArea: '#realcatcher', // 接球員 (感應區)
      basket: '.walk',            // 接取物件
      explosion: '.toExplosion',  // 預計爆炸物件
    },
    explosion: 'explosion', // 爆炸 class
    gameTime: 30, // 遊戲時間
    total: 10000, // 總點數
    billList:[
      200, 200, 200, 200, 200, 200, 200, 200,
      400, 400, 400, 400,
      600, 600,
      1000
    ], // 面額
    endCallback: (score) => {
      console.log('遊戲結束 callback');
      console.log(score);
    },
  };

  const myCatcher = new CatcherGame(gameConfig);

});