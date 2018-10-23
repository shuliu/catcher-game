
/**
 * 隨機範圍 (四捨五入)
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @return {number} 隨機值
 */
export function randomRound(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

/**
 * 隨機範圍 (有小數點floor)
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @return {number} 隨機值 (floor)
 */
export function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * shuffle 打散
 * @param {array} arr 陣列
 * @return {array} 打散後的新陣列
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * 累加器
 * @param {string|number} accumulator
 * @param {string|number} currentValue
 * @return {string|number} 累加後結果
 */
export function reducer(accumulator, currentValue) {
  return accumulator + currentValue;
}

/**
 * json Object 轉 Map
 * @param {object} obj json object
 * @return {Map} 轉譯後的參數
 */
export function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    if (typeof obj[k] === 'object') {
      strMap.set(k, objToStrMap(obj[k]));
    } else {
      strMap.set(k, obj[k]);
    }
  }
  return strMap;
}

/**
 * css animation play state
 * @param {Element} elem
 * @param {string} state
 * @return {Element} elem
 */
export function animateState(elem, state = 'running') {
  let defaultState = ['paused', 'running'];
  state = state.toLowerCase();
  if (defaultState.indexOf(state) < 0) {
    return false;
  }

  elem.style.animationPlayState = state;
  return elem;
}

/**
 * 取得 css transform 座標 x, y
 * @param {Element} item
 * @return {array} [x, y]
 */
export function getTranslate(item) {
  var transArr = [];

  if (!window.getComputedStyle) return;
  var style = getComputedStyle(item),
    transform = style.transform || style.webkitTransform || style.mozTransform || style.msTransform;
  var mat = transform.match(/^matrix3d\((.+)\)$/);
  if (mat) return parseFloat(mat[1].split(', ')[13]);

  mat = transform.match(/^matrix\((.+)\)$/);
  mat ? transArr.push(parseFloat(mat[1].split(', ')[4])) : transArr.push(0);
  mat ? transArr.push(parseFloat(mat[1].split(', ')[5])) : transArr.push(0);

  return transArr;
}

/**
 * Last segment of URL
 * @return {string} last segment
 */
export function getLastSegmentOfURL() {
  let url = location.origin + location.pathname;
  if(url.substr(-1) === '/') {
    url = url.substring(0, url.length-1);
  }
  return url.substr(url.lastIndexOf('/') + 1);
}
