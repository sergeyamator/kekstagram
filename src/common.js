'use strict';

function _getIndex(node, el) {
  var nodeList = Array.prototype.slice.call(node.children),
    index = nodeList.indexOf(el);

  return index;
}

module.exports = {
  PICTURES_LOAD_URL: '//o0.github.io/assets/json/pictures.json',
  PAGE_SIZE: 12,
  filteredPictures: [],
  renderedPictures: [],
  pictureContainer: document.querySelector('.pictures'),
  getIndex: _getIndex
};
