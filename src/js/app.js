/*eslint no-unused-vars: 0*/
/*eslint ignore: TimelineMax*/

import { Catcher as CatcherGame } from './Catcher.js';
import Promise from "promise";
import axios from "axios";
import qs from 'qs';
import { default as APIS } from './vendor/apis';

document.addEventListener("DOMContentLoaded", () => {

  const gamePromise = new Promise((resolve, reject) => {
    axios({
        method: 'get',
        url: APIS.GET_INFO_API,
        // responseType: 'json',
      })
      .then((res) => resolve(res))
      .catch(error => reject(error));
  });

  /**
   * 顯示 loading 畫面
   */
  const showLoading = () => {
    hideModal('.hint');
    hideModal('.time_up');
    hideModal('.game_over');

    const elem = document.querySelector('.loading');
    elem.style.display = 'block';
  };

  /**
   * 隱藏 loading 畫面
   */
  const hideLoading = () => {
    const elem = document.querySelector('.loading');
    elem.style.display = 'none';
  }

  /**
   * 展開某個 modal
   * @param {string} select
   */
  const showModal = (select) => {
    const bk = document.querySelector('.bk'); // 背景黑底
    const elem = document.querySelector(select);

    bk.style.display='block';
    elem.style.display='block';
  }

  /**
   * 隱藏某個 modal
   * @param {string} select
   */
  const hideModal = (select) => {
    const bk = document.querySelector('.bk'); // 背景黑底
    const elem = document.querySelector(select); // 遊戲開始提示

    bk.style.display='none';
    elem.style.display='none';
  }

  /**
   * ajax 回傳結果判斷是否進行遊戲
   * @param {object} value ajax response data
   */
  const checkCanPlay = (value) => {
    let data = value.data;
    if(data.status === 'error') {
      alert(data.message);
      location.href=data.redirect;
      return '';
    }

    gameConfig.gameTime = parseInt(data.time, 10);
    gameConfig.total = parseInt(data.point, 10);
    gameConfig.billList = data.denomination.split(',').map(Number);

    if(data.status === 'error') {
      alert(data.message);
      // location.href = APIS.WEB_URL;
    }
    if(value.data.status === 'play') {
      hideLoading();
      const myCatcher = new CatcherGame(gameConfig);
    }
  };

  /**
   * post score to db
   * @param {object} res response json object
   */
  const postUserDataCallback = (res, userData) => {
    let gameOver = document.querySelector('.game_over .score_text');
    let timeUp = document.querySelector('.time_up .score_text');
    gameOver.textContent = userData.score;
    timeUp.textContent = userData.score;
    hideLoading();
    showModal( userData.time <= 0 ? '.time_up' : '.game_over');
  };

  /**
   * API 出錯轉跳回首頁
   * @param {string} error
   */
  const ajaxError = (error) => {
    window.console && console.log(error);
    alert('系統忙碌中請稍候再試。');
    location.href = WEB_URL;
  }

  /**
   * post score to db
   * @param {object} userData {score, time}
   */
  const postUserData = (userData) => {
    showLoading();
    let score = userData.score;
    const postPromise = new Promise((resolve, reject) => {
      // axios post 寫法
      axios({
        method: 'post',
        url: APIS.POST_INFO_API,
        data: qs.stringify({ score }),
        responseType: 'json',
      })
        .then((res) => resolve(res))
        .catch(error => reject(error));
    });
    postPromise
      .then((res) => {
        postUserDataCallback(res, userData)
      })
      .catch(ajaxError);
  };

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
    initialCallback: () => {
      showModal('.hint');
    },
    startCallback: () => {
      hideModal('.hint');
    },
    endCallback: (score, time) => {
      postUserData({ score, time });
    },
  };

  showLoading();
  gamePromise
    .then(checkCanPlay)
    .catch(ajaxError);

});