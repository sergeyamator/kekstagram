'use strict';

var PICTURES_LOAD_URL = '//o0.github.io/assets/json/pictures.json';

var DEFAULT_FILTER = 'filter-new';

/** @constant {number} */
var PAGE_SIZE = 4;

/** @type {number} */
var pageNumber = 0;

/** @type {Array.<Object>} */
var filteredPictures = [];

var filters = document.querySelector('.filters'),
  pictureContainer = document.querySelector('.pictures'),
  pictureTmpl = document.querySelector('#picture-template'),
  elementToClone = null;

filters.classList.add('hidden');

/**
 * Проверяем поддерживает ли браузер тег template
 * @returns {boolean}
 */
function supportsTemplate() {
  return 'content' in document.createElement('template');
}

/**
 * @param {Object} data
 * @param {HTMLElement} container
 * @return {HTMLElement}
 */
function getPictureElement(data, container) {
  var element = elementToClone.cloneNode(true),
    img = new Image(182, 182);

  img.addEventListener('load', successCallback);

  img.addEventListener('error', errorCallback);

  img.src = data.url;
  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;

  container.appendChild(element);
  return element;

  function successCallback() {
    element.insertBefore(img, element.querySelector('.picture-stats'));
  }

  function errorCallback() {
    element.classList.add('picture-load-failure');
  }
}

if (supportsTemplate()) {
  elementToClone = pictureTmpl.content.querySelector('.picture');
} else {
  elementToClone = pictureTmpl.querySelector('.picture');
}

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

  xhr.open('GET', PICTURES_LOAD_URL);
  xhr.send();

  pictures.classList.add('pictures-loading');

  function successRequestCallback(evt) {
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);

    filters.classList.remove('hidden');
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

/**
 *
 * @returns {boolean}
 */
function isBottomReached() {
  var GAP = 100,
    footerElement = document.querySelector('footer'),
    footerPosition = footerElement.getBoundingClientRect();

  return footerPosition.top - window.innerHeight - GAP <= 0;
}

function setScrollEnabled() {
  window.addEventListener('scroll', scrollHandler);
}

function scrollHandler(evt) {
  if (isBottomReached() &&
    isNextPageAvailable(window.pictures, pageNumber, PAGE_SIZE)) {
    pageNumber++;
    renderPictures(filteredPictures, pageNumber, false);
  }
}

getPictures(function(loadedPictures) {
  window.pictures = loadedPictures;
  setFiltraionEnabled();
  setScrollEnabled();
  setFilterEnabled(DEFAULT_FILTER);
});

/**
 *
 * @param {Array.<Object>} pictures
 * @param {number} page
 * @param {boolean=} replace
 */
function renderPictures(pictures, page, replace) {
  if (replace) {
    pictureContainer.innerHTML = '';
  }

  var from = page * PAGE_SIZE,
    to = from + PAGE_SIZE;

  pictures.slice(from, to).forEach(function(picture) {
    getPictureElement(picture, pictureContainer);
  });
}

function setFiltraionEnabled() {
  var filtersForm = document.querySelector('.filters');
  pageNumber = 0;
  renderPictures(filteredPictures, pageNumber);

  filtersForm.addEventListener('change', function(evt) {
    var currentElement = evt.target;
    if (currentElement.tagName === 'INPUT') {
      setFilterEnabled(currentElement.id);
    }
  });
}


/**
 *
 * @param {string} filter
 */
function setFilterEnabled(filter) {
  filteredPictures = getFilteredPictures(window.pictures, filter);
  pageNumber = 0;
  renderPictures(filteredPictures, pageNumber, true);
}

function getFilteredPictures(pictures, filter) {
  var picturesToFilter = pictures.slice(0);

  if (filter === 'filter-new') {
    picturesToFilter.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  }

  if (filter === 'filter-discussed') {
    picturesToFilter.sort(function(a, b) {
      return b.comments - a.comments;
    });
  }

  return picturesToFilter;
}
