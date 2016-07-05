'use strict';

var common = require('./common');
var utils = require('./utils');

var REG_EXP = /#photos\/(\S+)/;

/**
 * Функция конструктор галлереии
 * @constructor
 */
function Gallery() {
  this.overlay = document.querySelector('.gallery-overlay');
  this._onDocumentKeyDown = _onDocumentKeyDown.bind(this);
  this._onPhotoClick = _onPhotoClick.bind(this);
  this.next = null;

  window.addEventListener('hashchange', this.togglePhoto.bind(this));
}

Gallery.prototype.show = function() {
  this.overlay.classList.remove('invisible');
  this.overlay.addEventListener('click', this._onPhotoClick);
  this.showPicture(this.prevIndex);

  document.addEventListener('keydown', this._onDocumentKeyDown);
};

/**
 * В случае ненадобности закрываем галлерею,
 * а также удаляем все обработчики события, котрые
 * повешаны на нее
 */
Gallery.prototype.remove = function() {
  this.overlay.classList.add('invisible');
  this.overlay.removeEventListener('click', this._onPhotoClick);
  this.overlay.removeEventListener('click', this.removeGallery);

  document.removeEventListener('keydown', this._onDocumentKeyDown);
  history.pushState(null, null, window.location.pathname);
};

/**
 * Отображаем галлерею. Если был передан аргумент - строка,
 * содержащая путь к картинке - тогда первой отобразиться
 * указанная картинка
 * @param {String} index
 */
Gallery.prototype.showPicture = function(index) {
  var picture = this.overlay.querySelector('.gallery-overlay-image'),
    data = null;

  if (typeof index === 'string') {
    common.renderedPictures.forEach(function(item, count, arr) {
      if (index === item.url) {
        data = item;
        this.next = arr[++count];
      }
    }.bind(this));
  } else {
    data = common.renderedPictures[index] || this.data;
  }

  if (data) {
    picture.src = data.url;
    this.setComments(data.comments);
    this.setLikes(data.likes);
    this.show();
  }
};

/**
 * Переключаем на фотографию, указанную в адресной строке.
 * Если эта строка не проходит проверку - закрываем галлерею.
 */
Gallery.prototype.togglePhoto = function() {
  if (location.hash.match(REG_EXP)) {
    var hash = location.hash;
    hash = hash.substr(1);
    this.showPicture(hash);
  } else {
    this.remove();
  }
};

/**
 * Устанавливаем переданную data в качестве
 * значения строки элемента
 * @param {HTMLElement} element
 * @param data
 */
Gallery.prototype.setCounts = function(element, data) {
  element.textContent = data;
};

/**
 * Сетим количество комментариев для элемента
 * @param {Number} data
 */
Gallery.prototype.setComments = function(data) {
  var commentElement = this.overlay.querySelector('.comments-count');
  this.setCounts(commentElement, data);
};

/**
 * Сетим количество лайков для элемента
 * @param {Number} data
 */
Gallery.prototype.setLikes = function(data) {
  var likesElement = this.overlay.querySelector('.likes-count');
  this.setCounts(likesElement, data);
};

/**
 * По клику на фотографию достаем следующую фотографию и
 * ее путь сетим в качестве параметра url
 * @param {MouseEvent} evt
 * @private
 */
function _onPhotoClick(evt) {
  if (!evt.target.closest('.gallery-overlay-preview')) {
    this.remove();
  }

  if (evt.target.classList.contains('gallery-overlay-image') && this.next) {
    location.hash = this.next.url;
  }
}

/**
 * По клику на клавишу escape закрываем галлерею
 * @param {KeyboardEvent} evt
 * @private
 */
function _onDocumentKeyDown(evt) {
  if (evt.keyCode === utils.keyCode.ESC) {
    this.remove();
  }
}

module.exports = Gallery;

