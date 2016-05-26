'use strict';

function getMessage(a, b) {
  if (typeof a === 'boolean') {
    if (a) {
      return 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров';
    } else {
      return 'Переданное GIF-изображение не анимировано';
    }
  } else if (typeof a === 'number') {
    return 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + (b * 4) + ' атрибутов';
  } else if ((a instanceof Array) && (b instanceof Array)) {
    var square = a.reduce(function(res, current, index) {
      return res + (current * b[index]);
    });

    return 'Общая площадь артефактов сжатия: ' + square +  'пикселей';
  } else if (a instanceof Array) {
    var sum = sumArray(a);

    return 'Количество красных точек во всех строчках изображения: ' + sum;
  }

  function sumArray(arr) {
    return arr.reduce(function(sum, current) {
      return sum + current;
    });
  }
}
