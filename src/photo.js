'use strict';

var elementToClone = require('./elementToClone')();
var common = require('./common');
var utils = require('./utils');
var renderPictures = require('./renderPictures');

/** @type {number} */
var renderedPictureCount = 0;

/**
 *
 * @param {Object} data
 * @param {Object} allData
 * @param {HTMLElement} container
 * @constructor
 */
function Photo(data, container, allData) {
  this.allData = allData;
  this.data = data;
  this.element = container;
  this.img = null;
  this.prevIndex = 0;
  this.overlay = document.querySelector('.gallery-overlay');
  this._onDocumentKeyDown = _onDocumentKeyDown.bind(this);
  this._onPhotoClick = _onPhotoClick.bind(this);
}

var fn = Photo.prototype;

/**
 * @return {HTMLElement}
 */

fn.getPhotoElement = function() {
  var element = elementToClone.cloneNode(true);
  this.img = new Image(182, 182);

  this.img.addEventListener('load', function() {
    successCallback(element, this.img);
  }.bind(this));

  this.img.addEventListener('error', function() {
    errorCallback(element);
  });

  this.img.src = this.data.url;
  element.querySelector('.picture-comments').textContent = this.data.comments;
  element.querySelector('.picture-likes').textContent = this.data.likes;

  this.element.appendChild(element);
  this.img.addEventListener('click', this.showGallery.bind(this));
  common.renderedPictures.push(this.data);

  return element;
};

fn.showGallery = function(e) {
  var target = e.target;

  e.preventDefault();
  this.prevIndex = getIndex(document.querySelector('.pictures'), target.closest('.picture'));
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

function onLoadEndCallback() {
  renderedPictureCount++;

  if (renderedPictureCount === common.PAGE_SIZE) {
    if (utils.isBottom()) {
      renderPictures.render(common.filteredPictures, common.pageNumber, false);
      renderedPictureCount = 0;
    }
  }
}

function successCallback(element, img) {
  element.insertBefore(img, element.querySelector('.picture-stats'));
  onLoadEndCallback();
}

function errorCallback(element) {
  element.classList.add('picture-load-failure');
  onLoadEndCallback();
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

function getIndex(node, el) {
  var nodeList = Array.prototype.slice.call(node.children),
    index = nodeList.indexOf(el);

  return index;
}

module.exports = Photo;
