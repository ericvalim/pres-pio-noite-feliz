/* Única origem do Pixel na página de vendas. Não registra compras. */
(function (window, document) {
  'use strict';

  // Impede duplicação caso este arquivo seja incluído mais de uma vez.
  if (window.__pnfMetaPixelLoaded) return;
  window.__pnfMetaPixelLoaded = true;

  if (!window.fbq) {
    var fbq = window.fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  window.fbq('init', '2573332176467688');
  window.fbq('trackSingle', '2573332176467688', 'PageView');
})(window, document);
