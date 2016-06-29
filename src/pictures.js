'use strict';

var common = require('./common'),
  utils = require('./utils'),
  renderPictures = require('./renderPictures'),
  filter = require('./filter'),
  gallery = require('./gallery');

var DEFAULT_FILTER = 'filter-new';

/** @constant {number} */
var THROTTLE_DELAY = 100;

/**
 *
 * @param {function(Array.<Object>)} callback
 */
function getPictures(callback) {
  var xhr = new XMLHttpRequest(),
    pictures = document.querySelector('.pictures');

  xhr.addEventListener('load', successRequestCallback);

  /**
   * If error add error class
   */
  xhr.addEventListener('error', failedRequestCallback);

  /**
   * Hide preloader
   */
  xhr.addEventListener('loadend', loadEndCallback);

  xhr.open('GET', common.PICTURES_LOAD_URL);
  xhr.send();

  pictures.classList.add('pictures-loading');

  function successRequestCallback(evt) {
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);

    filter.getFilters().classList.remove('hidden');
  }

  function removePreloader() {
    pictures.classList.remove('pictures-loading');
  }

  function loadEndCallback() {
    removePreloader();
  }

  function failedRequestCallback() {
    pictures.classList.add('pictures-failure');
  }
}

/**
 *
 * @param {Array} pictures
 * @param {number} page
 * @param {number} pageSize
 * @returns {boolean}
 */
function isNextPageAvailable(pictures, page, pageSize) {
  return page < Math.ceil(pictures.length / pageSize);
}

function setScrollEnabled() {
  window.addEventListener('scroll', utils.throttle(scrollHandler, THROTTLE_DELAY));

  function scrollHandler() {
    if (utils.isBottomReached() &&
      isNextPageAvailable(window.pictures, common.pageNumber, common.PAGE_SIZE)) {
      common.pageNumber++;
      renderPictures.render(common.filteredPictures, common.pageNumber, false);
    }
  }
}

getPictures(function(loadedPictures) {
  window.pictures = loadedPictures;
  filter.setFiltraionEnabled();
  setScrollEnabled();
  filter.setFilterEnabled(DEFAULT_FILTER);
});

filter.setFiltraionEnabled();
document.addEventListener('click', showGallery);

function showGallery(evt) {
  var target = evt.target,
    element = target.closest('.picture'),
    index = 0;

  if (element) {
    evt.preventDefault();

    var nodeList = Array.prototype.slice.call( document.querySelector('.pictures').children );
    index = nodeList.indexOf(element);
    gallery.showGallery(index);
  }
}



