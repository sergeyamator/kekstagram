'use strict';

var data = null;

function savePictures(pictures) {
  data = pictures;
}

module.exports = {
  savePictures: savePictures
};
