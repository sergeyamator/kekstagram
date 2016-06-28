'use strict';

var utils = require('./utils');

var data = null,
  container = document.querySelector('.gallery-overlay');

function savePictures(pictures) {
  data = pictures;
}

function showGallery(index) {
  container.classList.remove('invisible');

  container.addEventListener('click', _onPhotoClick);
  container.addEventListener('click', destroyGallery);
  container.addEventListener('keydown', _onDocumentKeyDown);

  showPictureByIndex(index);
}

function destroyGallery(evt) {
  if (!evt.target.closest('.gallery-overlay-preview')) {
    container.classList.add('invisible');
    container.removeEventListener('click', _onPhotoClick);
    container.removeEventListener('keydown', _onDocumentKeyDown);
  }
}

function _onPhotoClick(evt) {
  if (evt.target.classList.contains('.gallery-overlay-image')) {
    showPictureByIndex(1);
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
