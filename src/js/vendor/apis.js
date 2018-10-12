
/** @var string WEB_URL online 網址 */
let WEB_URL = 'https://online.senao.com.tw';

/** @var string GET_INFO_API 取得遊戲資訊 api */
let GET_INFO_API = '/eventsite/Catcher/201810/getInfo';

/** @var string POST_INFO_API 遊戲結束後發送點數 api */
let POST_INFO_API = '/eventsite/Catcher/201810/post';
let EVENT_KEY = location.href.split('/').pop();
if(
  location.host.indexOf('.local') >= 0 ||
  location.host.indexOf('labonline') >= 0 ||
  location.host.indexOf('stgonline') >= 0 ||
  location.host.indexOf('online.senao.com.tw') >= 0
) {
  WEB_URL = `//${location.host}`;
  GET_INFO_API = `${WEB_URL}/eventsite/Catcher/${EVENT_KEY}/getInfo`;
  POST_INFO_API = `${WEB_URL}/eventsite/Catcher/${EVENT_KEY}/post`;
}

// if( location.port === '8000' ) {
//   EVENT_KEY = '201810';
//   WEB_URL = `//ci3.local`;
//   GET_INFO_API = `${WEB_URL}/eventsite/Catcher/${EVENT_KEY}/getInfo`;
//   POST_INFO_API = `${WEB_URL}/eventsite/Catcher/${EVENT_KEY}/post`;
// }

export default { WEB_URL, GET_INFO_API, POST_INFO_API };
