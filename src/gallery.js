'use strict';

var common = require('./common');
var utils = require('./utils');

function Gallery() {
  this.overlay = document.querySelector('.gallery-overlay');

  this._onDocumentKeyDown = _onDocumentKeyDown.bind(this);
  this._onPhotoClick = _onPhotoClick.bind(this);
}

Gallery.prototype.show = function(e) {
  var target = e.target;

  e.preventDefault();
  this.prevIndex = common.getIndex(document.querySelector('.pictures'), target.closest('.picture'));
  this.overlay.classList.remove('invisible');
  this.overlay.addEventListener('click', this._onPhotoClick);
  document.addEventListener('keydown', this._onDocumentKeyDown);
  this.showPicture(this.prevIndex);
};

Gallery.prototype.remove = function() {
  this.overlay.classList.add('invisible');
  this.overlay.removeEventListener('click', this._onPhotoClick);
  this.overlay.removeEventListener('click', this.removeGallery);
  document.removeEventListener('keydown', this._onDocumentKeyDown);
};

Gallery.prototype.showPicture = function(index) {
  var picture = this.overlay.querySelector('.gallery-overlay-image'),
    commentElement = this.overlay.querySelector('.comments-count'),
    likesElement = this.overlay.querySelector('.likes-count');

  var data = common.renderedPictures[index] || this.data;
  picture.src = data.url;

  this.setCount(commentElement, data.comments);
  this.setCount(likesElement, data.likes);
};

Gallery.prototype.setCount = function(element, count) {
  element.textContent = count;
};

function _onPhotoClick(evt) {
  if (!evt.target.closest('.gallery-overlay-preview')) {
    this.remove();
  }

  if (evt.target.classList.contains('gallery-overlay-image')) {
    this.showPicture(++this.prevIndex);
  }
}

function _onDocumentKeyDown(evt) {
  if (evt.keyCode === utils.keyCode.ESC) {
    this.remove();
  }
}

module.exports = Gallery;

