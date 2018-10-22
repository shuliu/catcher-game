
const TITLE = '神降好運 狂歡接彩球';

/** @var {string} WEB_URL online 網址 */
let WEB_URL = `${location.protocol}//${location.host}`;


/** @var {string} EVENT_KEY 活動 key */
let EVENT_KEY = 'devKey';

/** @var {string} EVENT_URL 活動網址 */
let EVENT_URL = `${WEB_URL}/eventsite/Catcher/${EVENT_KEY}`;

/** @var {string} GET_INFO_API 取得遊戲資訊 api */
let GET_INFO_API = `${EVENT_URL}/getInfo`;
/** @var {string} GET_INFO_API_ERROR_DATE 不在活動期間 */
let GET_INFO_API_ERROR_DATE = `${EVENT_URL}/getInfo-date`;
/** @var {string} GET_INFO_API_ERROR_LOGIN 未登入 */
let GET_INFO_API_ERROR_LOGIN = `${EVENT_URL}/getInfo-login`;
/** @var {string} GET_INFO_API_ERROR_OVER 超過當日人數 */
let GET_INFO_API_ERROR_OVER = `${EVENT_URL}/getInfo-over`;
/** @var {string} GET_INFO_API_ERROR_PLAY 本日已玩過 */
let GET_INFO_API_ERROR_PLAY = `${EVENT_URL}/getInfo-play`;

/** @var {string} POST_INFO_API 遊戲結束後發送點數 api */
let POST_INFO_API = '/eventsite/Catcher/201810/post';

// PHP端 api 路徑判斷
if(
  location.host.indexOf('.local') >= 0 ||
  location.host.indexOf('senao.com.tw') >= 0
) {

  WEB_URL = `//${location.host}`;
  EVENT_URL = `${WEB_URL}/eventsite/Catcher/${EVENT_KEY}`;
  GET_INFO_API = `${EVENT_URL}/getInfo`;
  GET_INFO_API_ERROR_DATE = GET_INFO_API;
  GET_INFO_API_ERROR_LOGIN = GET_INFO_API;
  GET_INFO_API_ERROR_OVER = GET_INFO_API;
  GET_INFO_API_ERROR_PLAY = GET_INFO_API;
  POST_INFO_API = `${EVENT_URL}/post`;
}

const APIs = {
  TITLE,
  WEB_URL,
  EVENT_URL,
  GET_INFO_API,
  GET_INFO_API_ERROR_DATE,
  GET_INFO_API_ERROR_LOGIN,
  GET_INFO_API_ERROR_OVER,
  GET_INFO_API_ERROR_PLAY,
  POST_INFO_API
};

export default APIs;
