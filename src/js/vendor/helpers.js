const randomRound = (min, max) => (Math.round(Math.random() * (max - min) + min));
const random = (min, max) => (Math.random() * (max - min) + min);
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const reducer = (accumulator, currentValue) => (accumulator + currentValue);

/**
 * json Object 轉 Map
 * @param {object} obj json object
 * @return {Map} 轉譯後的參數
 */
function objToStrMap(obj) {
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
 */
function animateState(elem, state = 'running') {
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
 * @returns {array} [x, y]
 */
function getTranslate(item) {
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

export default {
  randomRound,
  random,
  shuffle,
  reducer,
  objToStrMap,
  animateState,
  getTranslate
}