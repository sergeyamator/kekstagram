'use strict';

var common = require('./common');
var utils = require('./utils');
var renderPictures = require('./renderPictures');
var filter = require('./filter');

var DEFAULT_FILTER = localStorage.getItem('filter') || '';

/** @constant {number} */
var THROTTLE_DELAY = 100;

/**
 * Получаем список всех изображений из json
 * @param {function(Array.<Object>)} callback
 */
function getPictures(callback) {
  var xhr = new XMLHttpRequest(),
    pictures = document.querySelector('.pictures');

  xhr.addEventListener('load', successRequestCallback);
  xhr.addEventListener('error', failedRequestCallback);
  xhr.addEventListener('loadend', loadEndCallback);

  xhr.open('GET', common.PICTURES_LOAD_URL);
  xhr.send();

  pictures.classList.add('pictures-loading');

  /**
   * При успешном ответе сервера принимаем данные,
   * и вызываем фукцию передавая эти данные
   * @param evt
   */
  function successRequestCallback(evt) {
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);

    filter.getFilters().classList.remove('hidden');
  }

  /**
   * После загрузки изображений скрываем прелодер
   */
  function removePreloader() {
    pictures.classList.remove('pictures-loading');
  }

  function loadEndCallback() {
    removePreloader();
  }

  /**
   * Если будет ошибка и изображение не загрузится - вешаем
   * класс, который покажет пользователю это
   */
  function failedRequestCallback() {
    pictures.classList.add('pictures-failure');
  }
}

/**
 * Проверяем есть ли у нас еще фотографии для отрисовки
 * @param {Array} pictures
 * @param {number} page
 * @param {number} pageSize
 * @returns {boolean}
 */
function isNextPageAvailable(pictures, page, pageSize) {
  return page < Math.ceil(pictures.length / pageSize);
}

/**
 * Запускаем добавление картинок по скролу странички
 */
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

/**
 * Когда получили изображения из json, запускаем
 * основной функционал отрисовки изображений
 */
getPictures(function(loadedPictures) {
  window.pictures = loadedPictures;
  filter.setFiltraionEnabled();
  setScrollEnabled();
  filter.setFilterEnabled(DEFAULT_FILTER);
});





