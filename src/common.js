'use strict';

/**
 *
 * @param {HTMLElement} node
 * @param {HTMLElement} element
 * @returns {number} index
 * @private
 */
function _getIndex(node, element) {
  var nodeList = Array.prototype.slice.call(node.children),
    index = nodeList.indexOf(element);

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
