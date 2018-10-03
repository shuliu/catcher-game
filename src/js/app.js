/*eslint no-unused-vars: 0*/
/*eslint ignore: TimelineMax*/

import { Catcher as CatcherGame } from './Catcher.js';

document.addEventListener("DOMContentLoaded", () => {

  /** 預設遊戲參數 normal */
  const easyConfig = {
    container: '#gameBox',        // 遊戲框
    scoreBoard: '#score-board', // 計分板
    timerBoard: '#timer-board', // 倒數計時板
    giftColors: ['.ball', '.ball_2', '.ball_3', '.ball_4', '.ball_5',],
    elements: {
      gift: '.gift',              // 彩球
      boom: '.BoomAnimate',       // 炸彈
      sensingArea: '#realcatcher', // 接球員 (感應區)
      basket: '.walk',            // 接取物件
      explosion: '.toExplosion',  // 預計爆炸物件
    },
    explosion: 'explosion', // 爆炸 class
    gameTime: 60, // 遊戲時間
    total: 10000, // 總點數
    billList: [1000, 600, 400, 200], // 面額
    endCallback: (score) => {
      console.log('遊戲結束 callback');
      console.log(score);
    },
  };

  const normalConfig = {
    container: '#gameBox',        // 遊戲框
    scoreBoard: '#score-board', // 計分板
    timerBoard: '#timer-board', // 倒數計時板
    giftColors: ['.ball', '.ball_2', '.ball_3', '.ball_4', '.ball_5',],
    elements: {
      gift: '.gift',              // 彩球
      boom: '.BoomAnimate',       // 炸彈
      sensingArea: '#realcatcher', // 接球員 (感應區)
      basket: '.walk',            // 接取物件
      explosion: '.toExplosion',  // 預計爆炸物件
    },
    explosion: 'explosion', // 爆炸 class
    gameTime: 30, // 遊戲時間
    total: 10000, // 總點數
    billList: [1000, 600, 400, 200], // 面額
    endCallback: (score) => {
      console.log('遊戲結束 callback');
      console.log(score);
    },
  };

  const hardConfig = {
    container: '#gameBox',        // 遊戲框
    scoreBoard: '#score-board', // 計分板
    timerBoard: '#timer-board', // 倒數計時板
    giftColors: ['.ball', '.ball_2', '.ball_3', '.ball_4', '.ball_5',],
    elements: {
      gift: '.gift',              // 彩球
      boom: '.BoomAnimate',       // 炸彈
      sensingArea: '#realcatcher', // 接球員 (感應區)
      basket: '.walk',            // 接取物件
      explosion: '.toExplosion',  // 預計爆炸物件
    },
    explosion: 'explosion', // 爆炸 class
    gameTime: 10, // 遊戲時間
    total: 10000, // 總點數
    billList: [1000, 600, 400, 200], // 面額
    endCallback: (score) => {
      console.log('遊戲結束 callback');
      console.log(score);
    },
  };
  let config = {
    // 簡單
    easy: easyConfig,
    // 普通
    normal: normalConfig,
    // 高速模式
    hard: hardConfig,
  };

  const myCatcher = new CatcherGame(config.normal);

});