
/** HTMLElement add empty method */
HTMLElement.prototype.empty = function () {
  var that = this;
  while (that.hasChildNodes()) {
    that.removeChild(that.lastChild);
  }
};

/** IE >= 9 forEach */
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
      }
  };
}

export default { HTMLElement, NodeList };