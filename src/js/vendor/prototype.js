
export default HTMLElement.prototype.empty = function () {
  var that = this;
  while (that.hasChildNodes()) {
    that.removeChild(that.lastChild);
  }
};
