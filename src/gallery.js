'use strict';

var utils = require('./utils');

var data = null,
  container = document.querySelector('.gallery-overlay'),
  prevIndex = null;

function savePictures(pictures) {
  data = pictures;
}

function showGallery(index) {
  prevIndex = index;
  container.classList.remove('invisible');
  container.addEventListener('click', _onPhotoClick);
  document.addEventListener('keydown', _onDocumentKeyDown);

  showPictureByIndex(index);
}

function destroyGallery() {
  container.classList.add('invisible');
  container.removeEventListener('click', _onPhotoClick);
  container.removeEventListener('click', destroyGallery);
  document.removeEventListener('keydown', _onDocumentKeyDown);
}

function _onPhotoClick(evt) {
  if (!evt.target.closest('.gallery-overlay-preview')) {
    destroyGallery();
  }

  if (evt.target.classList.contains('gallery-overlay-image')) {
    showPictureByIndex(++prevIndex);
  }
}

function _onDocumentKeyDown(evt) {
  if (evt.keyCode === utils.keyCode.ESC) {
    destroyGallery();
  }
}

function showPictureByIndex(index) {
  var picture = container.querySelector('.gallery-overlay-image'),
    commentElement = container.querySelector('.comments-count'),
    likesElement = container.querySelector('.likes-count');

  picture.src = data[index].url;

  setCount(commentElement, data[index].comments);
  setCount(likesElement, data[index].likes);
}

function setCount(element, count) {
  element.textContent = count;
}


module.exports = {
  showGallery: showGallery,
  savePictures: savePictures
};
