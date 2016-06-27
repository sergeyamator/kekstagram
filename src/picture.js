'use strict';

var elementToClone = require('./elementToClone')(),
  global = require('./common'),
  utils = require('./utils');

/** @type {number} */
var renderedPictureCount = 0;

function successCallback(element, img) {
  element.insertBefore(img, element.querySelector('.picture-stats'));
  onLoadEndCallback();
}

function errorCallback(element) {
  element.classList.add('picture-load-failure');
  onLoadEndCallback();
}

function onLoadEndCallback() {
  renderedPictureCount++;

  if (renderedPictureCount === global.PAGE_SIZE) {
    if (utils.isBottom()) {
      renderPictures(filteredPictures, common.pageNumber, false);
      renderedPictureCount = 0;
    }
  }
}

module.exports = {
  /**
   * @param {Object} data
   * @param {HTMLElement} container
   * @return {HTMLElement}
   */
  getPictureElement: function(data, container) {
    var element = elementToClone.cloneNode(true),
      img = new Image(182, 182);

    img.addEventListener('load', function() {
      successCallback(element, img);
    });

    img.addEventListener('error', function() {
      errorCallback(element);
    });
 
    img.src = data.url;
    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    container.appendChild(element);
    return element;
  }
};
