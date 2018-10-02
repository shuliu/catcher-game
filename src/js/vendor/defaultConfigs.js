/** @var {object} defaultConfig 預設設定 */
export default {
  container: '#gameBox',
  giftColors: ['.ball', '.ball_2', '.ball_3', '.ball_4', '.ball_5'], // 隨機彩球顏色
  elements: {
    basket: '#catcher',         // 接球員
    gift: '.gift',              // 彩球主體
    scoreBoard: '#score-board', // 計分板
    explosion: '.toExplosion',  // 預計爆炸物件
  },
  explosion: '.explosion', // 爆炸 class
  bombKey: 'bomb', // 炸彈 class 名稱
  hitKey: 'hit', // 碰撞 class 名稱
  total: 20000,  // 總點數
  billList: [1000, 800, 600, 400, 200], // 面額
  gameTime: 30, // 遊戲時間
  endCallback: (score) => {}, // 結束 callback
};