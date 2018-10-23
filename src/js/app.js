/*eslint no-unused-vars: 0*/
/*eslint ignore: TimelineMax*/

import { Catcher as CatcherGame } from './Catcher.js';
import Promise from "promise";
import axios from "axios";
import qs from 'qs';
import { default as APIs } from './vendor/apis';

document.addEventListener("DOMContentLoaded", () => {

  /**
   * 取得遊戲資訊
   * url: 遊戲資訊 api, 可替換成錯誤資訊路徑 (webpack.config.js devServer setup 內的資訊)
   */
  const gamePromise = new Promise((resolve, reject) => {
    axios({
        method: 'get',
        url: APIs.GET_INFO_API_ERROR_DATE,
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
      popupMessageToRedirect(data.message, data.redirect);
    }

    if(value.data.status === 'play') {
      hideLoading();
      const myCatcher = new CatcherGame(gameConfig);
      myCatcher.play();
      hideModal('.hint');
    }
  };

  /**
   * post score to db
   * @param {object} res response json object
   */
  const postUserDataCallback = (res, userData) => {
    if(res.data.status === 'error') {
      popupMessageToRedirect(res.data.message);
      hideLoading();
      return '';
    }

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
   * popup message and redirect
   * @param {string} message
   * @param {string} url
   */
  const popupMessageToRedirect = (message = '', url = '') => {
    if(message !== '') {
      alert(message);
      // console.log(message);
    }
    if(url !== '') {
      console.log(url);
      console.log(url === '');
      // location.href = url;
    }
  };

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
        url: APIs.POST_INFO_API,
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

  const checkToStart = () => {
    gamePromise
    .then(checkCanPlay)
    .catch(ajaxError);
  }

  const gameConfig = {
    container: '#gameBox',      // 遊戲容器
    scoreBoard: '#score-board', // 計分板
    timerBoard: '#timer-board', // 倒數計時板
    startBtn: '#js-start-btn',  // 綁定開始按鈕
    giftColors: ['.ball', '.ball_2', '.ball_3', '.ball_4', '.ball_5',], // 彩球 class
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
    bombLimit: [15, 20], // 炸彈數量 (亂數範圍)
    initialCallback: () => {
      // console.log('initial');
      // showModal('.hint');
    },
    startCallback: () => {
      // console.log('start');
      hideModal('.hint');
    },
    endCallback: (score, time) => {
      postUserData({ score, time });
    },
  };

  showLoading();

  // initial

  // 開始按鈕
  const checkToStartBtn = document.querySelector('#js-check-to-start-btn');
  if(checkToStartBtn === null) {
    throw('please building #js-check-to-start-btn btn');
  }
  checkToStartBtn.addEventListener('click', checkToStart);
  checkToStartBtn.addEventListener('touchend', checkToStart);

  showModal('.hint');
  hideLoading();

  // test //
  // const myCatcher = new CatcherGame(gameConfig);

});