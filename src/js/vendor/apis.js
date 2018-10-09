
/** @var string WEB_URL online 網址 */
let WEB_URL = 'https://online.senao.com.tw';

/** @var string GET_INFO_API 取得遊戲資訊 api */
let GET_INFO_API = '/public/catcher-game-info.json';

/** @var string POST_INFO_API 遊戲結束後發送點數 api */
let POST_INFO_API = '/public/catcher-game-info.json';

if(
  location.host.indexOf('labonline') >= 0 ||
  location.host.indexOf('stgonline') >= 0 ||
  location.host.indexOf('online.senao.com.tw') >= 0
) {
  WEB_URL = `https://${location.host}`;
  GET_INFO_API = `${WEB_URL}/eventsite/Catcher/201810/getInfo`;
  POST_INFO_API = `${WEB_URL}/eventsite/Catcher/201810/post`;
}

if( location.port === '8000' ) {
  WEB_URL = `http://ci3.local`;
  GET_INFO_API = `${WEB_URL}/eventsite/Catcher/201810/getInfo`;
  POST_INFO_API = `${WEB_URL}/eventsite/Catcher/201810/post`;
}

export default { WEB_URL, GET_INFO_API, POST_INFO_API };
