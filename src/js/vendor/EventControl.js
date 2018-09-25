import TargetMove from './TargetMove';
import ElementDTO from './ElementDTO';

/**
 * 遊戲控制
 */
export default class EventControl {

  /**
   * constructor
   * @param {HTMLElement} box 遊戲場景
   * @param {HTMLElement} elem 控制元件
   */
  constructor(box, elem) {
    console.log('[EventControl] Initial');

    this.ControlElementDTO = new ElementDTO();
    this.ControlElementDTO.box = box;
    this.ControlElementDTO.element = elem;
    this.myMove = new TargetMove(this.ControlElementDTO);

  }

  /**
   * 建立 catcher 並設置 drag 事件及起始位置
   */
  start() {
    this.myMove.setLocation();
    this.myMove.addDragEvent();
  }

  /** 停止控制事件 */
  stop() {
    this.myMove.removeDragEvent();
  }

}