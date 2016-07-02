'use strict';

var common = require('./common');
var utils = require('./utils');

function Gallery() {
  this.overlay = document.querySelector('.gallery-overlay');

  this._onDocumentKeyDown = _onDocumentKeyDown.bind(this);
  this._onPhotoClick = _onPhotoClick.bind(this);
}

var fn = Gallery.prototype;

fn.showGallery = function(e) {
  var target = e.target;

  e.preventDefault();
  this.prevIndex = _getIndex(document.querySelector('.pictures'), target.closest('.picture'));
  this.overlay.classList.remove('invisible');
  this.overlay.addEventListener('click', this._onPhotoClick);
  document.addEventListener('keydown', this._onDocumentKeyDown);
  this.showPicture(this.prevIndex);
};

fn.removeGallery = function() {
  this.overlay.classList.add('invisible');
  this.overlay.removeEventListener('click', this._onPhotoClick);
  this.overlay.removeEventListener('click', this.removeGallery);
  document.removeEventListener('keydown', this._onDocumentKeyDown);
};

fn.showPicture = function(index) {
  var picture = this.overlay.querySelector('.gallery-overlay-image'),
    commentElement = this.overlay.querySelector('.comments-count'),
    likesElement = this.overlay.querySelector('.likes-count');

  var data = common.renderedPictures[index] || this.data;
  picture.src = data.url;

  this.setCount(commentElement, data.comments);
  this.setCount(likesElement, data.likes);
};

fn.setCount = function(element, count) {
  element.textContent = count;
};

function _getIndex(node, el) {
  var nodeList = Array.prototype.slice.call(node.children),
    index = nodeList.indexOf(el);

  return index;
}

function _onPhotoClick(evt) {
  if (!evt.target.closest('.gallery-overlay-preview')) {
    this.removeGallery();
  }

  if (evt.target.classList.contains('gallery-overlay-image')) {
    this.showPicture(++this.prevIndex);
  }
}

function _onDocumentKeyDown(evt) {
  if (evt.keyCode === utils.keyCode.ESC) {
    this.removeGallery();
  }
}

module.exports = Gallery;

