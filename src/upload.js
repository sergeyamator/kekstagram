'use strict';

/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

var browserCookies = require('browser-cookies');

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  var form = document.querySelector('#upload-resize'),
    inputs = form.querySelectorAll('input'),
    submitButton = form.querySelector('#resize-fwd'),
    resizeXField = form.querySelector('#resize-x'),
    resizeYField = form.querySelector('#resize-y'),
    resizeSize = form.querySelector('#resize-size');

  [].forEach.call(inputs, function(item) {
    item.addEventListener('input', function() {
      blockSubmitIfNotValid();
      showError(item);
    });
  });

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    // Проверяем введенные значения на следующие критерии:
    // Сумма значений полей «слева» и «сторона» не должна быть больше ширины исходного изображения.
    // Сумма значений полей «сверху» и «сторона» не должна быть больше высоты исходного изображения.
    // Поля «сверху» и «слева» не могут быть отрицательными.

    if ((Number(resizeXField.value) + Number(resizeSize.value) > currentResizer._image.naturalWidth)
      || (Number(resizeYField.value) + Number(resizeSize.value) > currentResizer._image.naturalHeight)
      || (Number(resizeXField.value) < 0)
      || (Number(resizeYField.value) < 0)) {

      return false;
    } else {
      return true;
    }
  }

  /**
   * Блокируем кнопку отправки или нет в зависимости от того
   * проходил ли форма валидацию или нет
   */
  function blockSubmitIfNotValid() {
    if (!resizeFormIsValid()) {
      submitButton.setAttribute('disabled', 'true');
    } else {
      submitButton.removeAttribute('disabled');
    }
  }

  /**
   * Если поле не проходит html5 валидацию
   * показываем ошибку с текстом валидации
   * @param {HTMLElement} input
   */
  function showError(input) {
    if (!input.validity.valid) {
      var div = document.createElement('div');
      div.classList.add('controls-error');
      div.textContent = input.validationMessage;
      document.body.appendChild(div);
      div.addEventListener('click', closeError);
    }

    function closeError() {
      document.body.removeChild(div);
      div.removeEventListener('click', closeError);
    }
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
          enableConstraintByInputEvent();
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');

    saveSelectedFilter();
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });

  // Сохраняем последний выбранный фильтр в куку.
  function saveSelectedFilter() {
    var dateToExpire = new Date(Date.now() + amountDaysFromBirthday({month: 11, day: 24})),
      value = document.querySelector('.upload-filter-controls input:checked').value;

    browserCookies.set('value', value, {expires: dateToExpire});
  }

  // Узнаем разницу от между текущей даты и датой днем рождения.
  function amountDaysFromBirthday(date) {
    var now = new Date(),
      dateBirthday = new Date(),
      difference = 0;

    // Задаем дату рождения
    dateBirthday.setMonth(date.month);
    dateBirthday.setDate(date.day);

    if (now > dateBirthday) {
      difference = now - dateBirthday;
    } else {
      difference = now - dateBirthday.setFullYear(now.getFullYear() - 1);
    }

    return difference;
  }

  // Устанавливаем фильтр по-умолчанию основываясь на записях в куки.
  function setActiveFilter() {
    var controls = document.querySelector('.upload-filter-controls'),
      filterName = browserCookies.get('value') || 'none',
      filter = controls.querySelector('#upload-filter-' + filterName),
      img = document.querySelector('.filter-image-preview');

    filter.setAttribute('checked', true);
    img.classList.add('filter-' + filterName);
  }

  window.addEventListener('resizerchange', onResizerChange);

  /**
   * При событии resizerchange выводим значения X, Y, Side в
   * соответствующие поля фомы
   */
  function onResizerChange() {
    resizeXField.value = Math.round(currentResizer.getConstraint().x);
    resizeYField.value = Math.round(currentResizer.getConstraint().y);
    resizeSize.value = Math.round(currentResizer.getConstraint().side);
  }

  function enableConstraintByInputEvent() {
    var controls = document.querySelector('.upload-resize-controls');
    if (!controls) {
      return;
    }

    controls.addEventListener('input', onInput);
  }

  function onInput(evt) {
    var target = evt.target,
      container = evt.currentTarget;

    if (target.tagName !== 'INPUT') {
      return;
    }

    var values = getResizeControlsValue(container);
    currentResizer.setConstraint(values[0], values[1], values[2]);
  }

  function getResizeControlsValue(el) {
    var xValue = el.querySelector('#resize-x'),
      yValue = el.querySelector('#resize-y'),
      sideValue = el.querySelector('#resize-size');

    return [Number(xValue.value), Number(yValue.value), Number(sideValue.value)];
  }

  setActiveFilter();
  cleanupResizer();
  updateBackground();
})();
