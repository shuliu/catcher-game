import ElementDTO from './ElementDTO';
import Draggable from 'gsap/Draggable';

/**
 * 觸發 移動 method
 * @class TargetMove class
 */
export default class TargetMove {

  /**
   *
   * @param {ElementDTO} ControlElementDTO
   */
  constructor(ControlElementDTO) {

    /** @var deviceSize 遊戲範圍判斷, 小於 800 若判定為行動裝置尺寸 */
    this.deviceSize = 800;

    /** @var paddingHeight catcher 墊高的高度 */
    this.paddingHeight = 60;

    this.Control = ControlElementDTO;
    this.myDrag = null;

    /** 判斷目前裝置 */
    this.device = this.Control.box.clientWidth < this.deviceSize ? 'mobile' : 'desktop';
    if (this.device === 'mobile') {
      this.paddingHeight = 20;
    }

  }

  /** @var {Draggable} drag 抓取事件 */
  set drag(dragObj) {
    this.myDrag = dragObj;
  }

  get drag() {
    return this.myDrag[0];
  }

  /**
   * 建立 drag 事件
   * @description 感應範圍會因為物件 css scale(.5) 的關係 * 0.5
   */
  addDragEvent() {


    let maxX = this.Control.box.clientWidth - (this.Control.element.clientWidth * 0.5); // css scale(.5)
    if (this.device === 'mobile') {
      maxX = this.Control.box.clientWidth - (this.Control.element.clientWidth * 0.4); // css scale(.5)
    }

    let bounds = {
      minX: 0,
      maxX: maxX,
    };

    this.drag = Draggable.create(this.Control.element, {
      type: 'x',
      throwProps: true,
      bounds
    });

    Draggable.get(this.Control.element).enable();

  }

  /**
   * 停止 drag 事件
   */
  removeDragEvent() {
    // console.log('drag disabled');
    Draggable.get(this.Control.element).disable();
  }

  /**
   * 設定 catcher 起始位置
   */
  setLocation() {
    this.Control.element.style.display = 'inline-block';

    /** @const boxReal box 真實寬高座標資訊 */
    const boxReal = this.Control.box.getBoundingClientRect();
    /** @const elmReal element 真實寬高座標資訊 */
    const elmReal = this.Control.element.getBoundingClientRect();

    /** @var firstLocation catcher 起始座標 */
    let firstLocation = {
      x: (boxReal.width / 2 - elmReal.width / 2),
      y: boxReal.height - elmReal.height - this.paddingHeight,
    };

    if (this.device === 'mobile') {
      let bodyHeight = document.body.offsetHeight;
      firstLocation.y = bodyHeight - elmReal.height - this.paddingHeight;
    }

    TweenLite.set(this.Control.element, firstLocation);
  }
}