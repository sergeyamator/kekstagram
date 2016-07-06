'use strict';

var renderPictures = require('./renderPictures');
var common = require('./common');
var utils = require('./utils');
var filters = document.querySelector('.filters');

filters.classList.add('hidden');

/**
 * Делаем активный фильтр при загрузке странички
 * @param {HTMLElement} element
 * @private
 */
function _setCheckedFilter(element) {
  var inputs = element.querySelectorAll('input'),
    checkedFilter = 'filter-popular',
    filter = localStorage.getItem('filter') || 'filter-popular';

  [].forEach.call(inputs, function(item) {
    if (item.id.indexOf(filter) !== -1) {
      checkedFilter = item;
    }
  });

  checkedFilter.setAttribute('checked', true);
}

/**
 * Функция перерисовки изображений при
 * переключении фильтра
 */
function setFiltraionEnabled() {
  common.pageNumber = 0;
  renderPictures.render(common.filteredPictures, common.pageNumber, null, common.pictureContainer);

  _setCheckedFilter(filters);

  filters.addEventListener('change', function(evt) {
    var currentElement = evt.target;
    if (currentElement.tagName === 'INPUT') {
      this.setFilterEnabled(currentElement.id);
    }
  }.bind(this));
}

/**
 * Фильтруем список всех фотографий
 * с учетом выбранного фильтра
 * @param {Array} pictures
 * @param {String} filter
 * @returns {Array.<T>|*|ArrayBuffer|string|Blob}
 */
function getFilteredPictures(pictures, filter) {
  var picturesToFilter = pictures.slice(0);

  if (filter === 'filter-new') {
    picturesToFilter.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    localStorage.setItem('filter', 'filter-new');
  } else if (filter === 'filter-discussed') {
    picturesToFilter.sort(function(a, b) {
      return b.comments - a.comments;
    });

    localStorage.setItem('filter', 'filter-discussed');
  } else {
    localStorage.setItem('filter', 'filter-popular');
  }

  return picturesToFilter;
}

/**
 * Отрисовываем отфильтрованные изображения
 * @param {string} filter
 */
function setFilterEnabled(filter) {
  common.filteredPictures = this.getFilteredPictures(window.pictures, filter);
  common.pageNumber = 0;
  renderPictures.render(common.filteredPictures, common.pageNumber, true, common.pictureContainer);

  while (utils.isBottom()) {
    renderPictures.render(common.filteredPictures, common.pageNumber, false, common.pictureContainer);
  }
}

/**
 * Возвращаем блок с фильтрами
 * @returns {Element}
 */
function getFilters() {
  return filters;
}

module.exports = {
  setFiltraionEnabled: setFiltraionEnabled,

  getFilteredPictures: getFilteredPictures,

  setFilterEnabled: setFilterEnabled,

  getFilters: getFilters
};
