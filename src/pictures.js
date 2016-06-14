'use strict';

var PICTURES_LOAD_URL = '//o0.github.io/assets/json/pictures.json';

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

  img.addEventListener('load', successLoad);

  img.addEventListener('error', errorLoad);

  img.src = data.url;
  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;

  container.appendChild(element);
  return element;

  function successLoad() {
    element.insertBefore(img, element.querySelector('.picture-stats'));
  }

  function errorLoad() {
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

  xhr.addEventListener('load', successRequest);

  /**
   * If error add error class
   */
  xhr.addEventListener('error', failedRequest);

  /**
   * Hide preloader
   */
  xhr.addEventListener('loadend', removePreloader);

  xhr.open('GET', PICTURES_LOAD_URL);
  xhr.send();

  pictures.classList.add('pictures-loading');

  function successRequest(evt) {
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);

    filters.classList.remove('hidden');
  }

  function removePreloader() {
    pictures.classList.remove('pictures-loading');
  }

  function failedRequest() {
    pictures.classList.add('pictures-failure');
  }
}

getPictures(function(loadedPictures) {
  window.pictures = loadedPictures;
  setFiltraionEnabled();
  renderPictures(window.pictures);
});

/**
 *
 * @param {Array.<Object>} pictures
 */
function renderPictures(pictures) {
  pictureContainer.innerHTML = '';

  pictures.forEach(function(picture) {
    getPictureElement(picture, pictureContainer);
  });
}

function setFiltraionEnabled() {
  var filtersForm = document.querySelector('.filters');

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
  var filteredPictures = getFilteredPictures(window.pictures, filter);
  renderPictures(filteredPictures);
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
