'use strict';

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

  img.addEventListener('load', function() {
    element.insertBefore(img, element.querySelector('.picture-stats'));
  });

  img.addEventListener('error', function() {
    element.classList.add('picture-load-failure');
  });

  img.src = data.url;
  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;

  container.appendChild(element);
  return element;
}

if (supportsTemplate()) {
  elementToClone = pictureTmpl.content.querySelector('.picture');
} else {
  elementToClone = pictureTmpl.querySelector('.picture');
}
window.pictures.forEach(function(picture) {
  getPictureElement(picture, pictureContainer);
});
