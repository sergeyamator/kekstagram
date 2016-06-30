'use strict';

var renderPictures = require('./renderPictures');
var common = require('./common');
var utils = require('./utils');
var filters = document.querySelector('.filters');

filters.classList.add('hidden');

module.exports = {
  setFiltraionEnabled: function() {
    var filtersForm = document.querySelector('.filters');
    common.pageNumber = 0;
    renderPictures.render(common.filteredPictures, common.pageNumber, null, common.pictureContainer);

    filtersForm.addEventListener('change', function(evt) {
      var currentElement = evt.target;
      if (currentElement.tagName === 'INPUT') {
        this.setFilterEnabled(currentElement.id);
      }
    }.bind(this));
  },

  getFilteredPictures: function(pictures, filter) {
    var picturesToFilter = pictures.slice(0);

    if (filter === 'filter-new') {
      picturesToFilter.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });
    }

    if (filter === 'filter-discussed') {
      picturesToFilter.sort(function(a, b) {
        return b.comments - a.comments;
      });
    }

    return picturesToFilter;
  },

  /**
   *
   * @param {string} filter
   */
  setFilterEnabled: function(filter) {
    common.filteredPictures = this.getFilteredPictures(window.pictures, filter);
    common.pageNumber = 0;
    renderPictures.render(common.filteredPictures, common.pageNumber, true, common.pictureContainer);

    while (utils.isBottom()) {
      renderPictures.render(common.filteredPictures, common.pageNumber, false, common.pictureContainer);
    }
  },

  getFilters: function() {
    return filters;
  }
};
