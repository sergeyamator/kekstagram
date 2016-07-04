'use strict';

var common = require('./common');
var utils = require('./utils');

var REG_EXP = /#photos\/(\S+)/;

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
  document.addEventListener('keydown', this._onDocumentKeyDown);
  this.showPicture(this.prevIndex);
};

Gallery.prototype.remove = function() {
  this.overlay.classList.add('invisible');
  this.overlay.removeEventListener('click', this._onPhotoClick);
  this.overlay.removeEventListener('click', this.removeGallery);
  document.removeEventListener('keydown', this._onDocumentKeyDown);
  history.pushState(null, null, window.location.pathname);
};

Gallery.prototype.showPicture = function(index) {
  var picture = this.overlay.querySelector('.gallery-overlay-image'),
    commentElement = this.overlay.querySelector('.comments-count'),
    likesElement = this.overlay.querySelector('.likes-count'),
    data = null,
    that = this;

  if (typeof index === 'string') {
    common.renderedPictures.forEach(function(item, count, arr) {
      if (index === item.url) {
        data = item;
        that.next = arr[++count];
      }
    });
  } else {
    data = common.renderedPictures[index] || this.data;
  }

  if (data) {
    picture.src = data.url;
    this.setCount(commentElement, data.comments);
    this.setCount(likesElement, data.likes);
    this.show();
  }
};

Gallery.prototype.togglePhoto = function() {
  if (location.hash.match(REG_EXP)) {
    var hash = location.hash;
    hash = hash.substr(1);
    this.showPicture(hash);
  } else {
    this.remove();
  }
};

Gallery.prototype.setCount = function(element, count) {
  element.textContent = count;
};

function _onPhotoClick(evt) {
  if (!evt.target.closest('.gallery-overlay-preview')) {
    this.remove();
  }

  if (evt.target.classList.contains('gallery-overlay-image') && this.next) {
    location.hash = this.next.url;
  }
}

function _onDocumentKeyDown(evt) {
  if (evt.keyCode === utils.keyCode.ESC) {
    this.remove();
  }
}

module.exports = Gallery;

