
/** @var {object} defaultConfig 預設設定 */
export default {
  container: '#gameBox',
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
  endCallback: (score) => {},
};
