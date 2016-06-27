'use strict';

var common = require('./common'),
  picture = require('./picture');

module.exports = {
  /**
   *
   * @param {Array.<Object>} pictures
   * @param {number} page
   * @param {boolean=} replace
   * @param {HTMLElement} pictureContainer
   */
  render: function(pictures, page, replace, pictureContainer) {
    if (replace) {
      pictureContainer.innerHTML = '';
    }

    var from = page * common.PAGE_SIZE,
      to = from + common.PAGE_SIZE,
      pictureToLoad = pictures.slice(from, to);

    pictureToLoad.forEach(function(pictureElement) {
      picture.getPictureElement(pictureElement, common.pictureContainer);
    });

  }
};
