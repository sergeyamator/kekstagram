module.exports = {
  /**
   * Проверяем поддерживает ли браузер тег template
   * @returns {boolean}
   */
  isTemplateSupported: function() {
    return 'content' in document.createElement('template');
  },

  /**
   * Проверяем, заполнились ли картинки до самого низа экрана или нет
   * @returns {boolean}
   */
  isBottom: function() {
    return window.innerHeight - document.querySelector('.pictures').offsetHeight > 0;
  },

  /**
   * Проверяем видин ли нам footer
   * @returns {boolean}
   */
  isBottomReached: function() {
    var GAP = 100,
      footerElement = document.querySelector('footer'),
      footerPosition = footerElement.getBoundingClientRect();

    return footerPosition.top - window.innerHeight - GAP <= 0;
  },

  throttle: function(callback, limit) {
    var wait = false;
    return function() {
      if (!wait) {
        callback.call();
        wait = true;
        setTimeout(function() {
          wait = false;
        }, limit);
      }
    };
  }
};

