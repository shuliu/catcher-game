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

    this.Control = ControlElementDTO;
    this.myDrag = null;

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
    let bounds = {
      minX: 0,
      maxX: this.Control.box.clientWidth - (this.Control.element.clientWidth * 0.5), // css scale(.5)
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
    const firstLocation = {
      x: (this.Control.box.clientWidth / 2 - this.Control.element.clientWidth / 2),
      y: (this.Control.box.offsetHeight - this.Control.element.offsetHeight) + 70,
    };


    TweenMax.set(this.Control.element, firstLocation);
  }
}