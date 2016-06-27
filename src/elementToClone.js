'use strict';

var utils = require('./utils');

var pictureTmpl = document.querySelector('#picture-template'),
  elementToClone = null;

if (utils.isTemplateSupported()) {
  elementToClone = pictureTmpl.content.querySelector('.picture');
} else {
  elementToClone = pictureTmpl.querySelector('.picture');
}

module.exports = function() {
  return elementToClone;
};
