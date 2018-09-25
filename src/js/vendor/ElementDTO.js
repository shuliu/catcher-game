/**
 * 元件 DTO
 * @private
 * @class SetElem class
 */
export default class ElementDTO {

  /**
   *
   * @param {HTMLElement} box 遊戲場景
   * @param {HTMLElement} elem 控制元件
   */
  constructor(box, elem) {
    /** @var {HTMLElemant} */
    this.gameBox = null;
    this.gameElement = null;

    this.box = box;
    this.element = elem;
  }

  /**
   * @private 建立遊戲場景
   * @param {HTMLElement} elem 遊戲場景
   */
  set box(elem) {
    if (elem instanceof HTMLElement === false) {
      return null;
    }

    this.gameBox = elem;
  }

  /**
   * @private 取得遊戲場景
   * @returns {HTMLElement|null} 遊戲場景
   */
  get box() {
    return this.gameBox || null;
  }

  /**
   * @private 建立控制元件
   * @param {HTMLElement} elem 控制元件
   */
  set element(elem) {
    if (elem instanceof HTMLElement === false) {
      return null;
    }

    this.gameElement = elem;
  }

  /**
   * @private 取得控制元件
   * @returns {HTMLElement|null} 控制元件
   */
  get element() {
    return this.gameElement || null;
  }
}