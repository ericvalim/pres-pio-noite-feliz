/* PREVIEW HELENA · teste local de posicionamento das imagens da personagem.
   Só é carregado pelo <head> do index.html quando a URL tem ?preview=helena.
   Copia cada <template data-preview="helena"> para o lugar indicado
   (ou troca o elemento, com data-posicao="replaceWith"):
     data-alvo     seletor do elemento de referência
     data-posicao  prepend | append | before | after | replaceWith
     data-variante (opcional) só entra com &variante=<valor> na URL
   Para remover o teste, apague este arquivo, css/preview-helena.css,
   o <script> do <head> e os <template data-preview="helena">. */
(function () {
  'use strict';

  var parametros = new URLSearchParams(window.location.search);
  var variante = parametros.get('variante');

  function aplicar() {
    var blocos = document.querySelectorAll('template[data-preview="helena"]');
    Array.prototype.forEach.call(blocos, function (bloco) {
      var exige = bloco.getAttribute('data-variante');
      if (exige && exige !== variante) return;

      var alvo = document.querySelector(bloco.getAttribute('data-alvo'));
      if (!alvo) return;

      var conteudo = bloco.content.cloneNode(true);
      var posicao = bloco.getAttribute('data-posicao') || 'append';
      if (typeof alvo[posicao] === 'function') alvo[posicao](conteudo);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicar);
  } else {
    aplicar();
  }
})();
