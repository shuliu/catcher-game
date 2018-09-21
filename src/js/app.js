/*eslint no-unused-vars: 0*/
/*eslint ignore: TimelineMax*/

import { Catcher as CatcherGame } from './Catcher.js';

document.addEventListener("DOMContentLoaded", () => {

  /** 預設遊戲參數 normal */
  const normalConfig = {
    container: '#gameBox',        // 遊戲框
      elements: {
        gift: '.gift',              // 彩球
        boom: '.BoomAnimate',       // 炸彈
        basket: '#catcher',         // 接取物件
        scoreBoard: '#score-board', // 計分板
      },
      gameTime: 30, // 遊戲時間
      total: 20000, // 總點數
      billList: [1000, 800, 600, 400, 200], // 面額
  };
  let config = {
    // 簡單
    easy: normalConfig,
    // 普通
    normal: normalConfig,
    // 高速模式
    hard: normalConfig,
  };

  // 遊戲難度遊戲時間不同
  config.easy.gameTime = 60;
  config.hard.gameTime = 10;

  const myCatcher = new CatcherGame(config.hard);

});