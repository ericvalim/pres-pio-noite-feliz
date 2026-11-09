/* ==========================================================
   Presépio Noite Feliz · comportamentos da página
   1. Repasse de UTM para os links de checkout
   2. Botão fixo "Ver planos" no celular
   3. Pop-up de saída (uma vez por sessão)
   ========================================================== */
(function () {
  'use strict';

  /* ---------- 1. Repasse de UTM ----------
     Pega todos os parâmetros da URL da página e acrescenta em todo
     link com data-checkout. Se o link já tiver o parâmetro, o valor
     do link é mantido. Funciona também com os placeholders {{...}}. */
  function repassarParametros() {
    if (!window.location.search || window.location.search.length < 2) return;
    if (typeof URLSearchParams === 'undefined') return;

    var daPagina = new URLSearchParams(window.location.search);
    var links = document.querySelectorAll('a[data-checkout]');

    Array.prototype.forEach.call(links, function (link) {
      var href = link.getAttribute('href') || '';

      var posHash = href.indexOf('#');
      var hash = posHash >= 0 ? href.slice(posHash) : '';
      var semHash = posHash >= 0 ? href.slice(0, posHash) : href;

      var posQuery = semHash.indexOf('?');
      var base = posQuery >= 0 ? semHash.slice(0, posQuery) : semHash;
      var queryOriginal = posQuery >= 0 ? semHash.slice(posQuery + 1) : '';

      var doLink = new URLSearchParams(queryOriginal);
      var chavesDoLink = {};
      doLink.forEach(function (_valor, chave) { chavesDoLink[chave] = true; });

      var acrescentou = false;
      daPagina.forEach(function (valor, chave) {
        if (!chavesDoLink[chave]) {
          doLink.append(chave, valor);
          acrescentou = true;
        }
      });

      if (!acrescentou) return;
      var query = doLink.toString();
      link.setAttribute('href', base + (query ? '?' + query : '') + hash);
    });
  }

  repassarParametros();

  /* ---------- Controle de sessão (pop-up) ---------- */
  var CHAVE_POPUP = 'pnf_popup_saida_visto';
  var popupJaVistoMemoria = false;

  function popupJaVisto() {
    if (popupJaVistoMemoria) return true;
    try {
      return window.sessionStorage.getItem(CHAVE_POPUP) === '1';
    } catch (e) {
      return false;
    }
  }

  function marcarPopupVisto() {
    popupJaVistoMemoria = true;
    try {
      window.sessionStorage.setItem(CHAVE_POPUP, '1');
    } catch (e) { /* navegação privada ou armazenamento bloqueado */ }
  }

  /* ---------- Estado compartilhado ---------- */
  var secao3 = document.getElementById('comece');
  var planos = document.getElementById('planos');
  var barra = document.getElementById('barra-planos');
  var popup = document.getElementById('popup-saida');

  var passouSecao3 = false;
  var planosVisivel = false;
  var viuPlanos = false;

  /* ---------- 2. Botão fixo "Ver planos" ---------- */
  function atualizarBarra() {
    if (!barra) return;
    var mostrar = passouSecao3 && !planosVisivel;
    barra.classList.toggle('is-visivel', mostrar);
    barra.setAttribute('aria-hidden', mostrar ? 'false' : 'true');
    var botao = barra.querySelector('a');
    if (botao) botao.setAttribute('tabindex', mostrar ? '0' : '-1');
  }

  if ('IntersectionObserver' in window) {
    if (secao3) {
      new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          // "Saiu da tela" = não está visível e ficou acima do topo.
          passouSecao3 = !e.isIntersecting && e.boundingClientRect.top < 0;
        });
        atualizarBarra();
      }).observe(secao3);
    }

    if (planos) {
      new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          planosVisivel = e.isIntersecting;
          if (e.isIntersecting) viuPlanos = true;
        });
        atualizarBarra();
      }).observe(planos);
    }
  }

  /* ---------- 3. Pop-up de saída ---------- */
  if (!popup) return;

  var focoAnterior = null;
  var carregouEm = Date.now();
  var ESPERA_MINIMA_MS = 3000; // evita abrir logo que a página carrega

  function focaveis() {
    return popup.querySelectorAll('a[href], button:not([disabled])');
  }

  function abrirPopup() {
    if (!popup.hidden || popupJaVisto()) return;
    if (Date.now() - carregouEm < ESPERA_MINIMA_MS) return;

    marcarPopupVisto();
    focoAnterior = document.activeElement;
    popup.hidden = false;
    document.body.classList.add('sem-rolagem');
    if (barra) barra.classList.remove('is-visivel');

    var primeiro = focaveis()[0];
    if (primeiro) primeiro.focus();
  }

  function fecharPopup() {
    if (popup.hidden) return;
    popup.hidden = true;
    document.body.classList.remove('sem-rolagem');
    atualizarBarra();
    if (focoAnterior && typeof focoAnterior.focus === 'function') focoAnterior.focus();
  }

  // Fechar: "Não, obrigada", clique fora da caixa, tecla Esc.
  popup.addEventListener('click', function (e) {
    if (e.target === popup || e.target.closest('[data-fechar-popup]')) fecharPopup();
  });

  document.addEventListener('keydown', function (e) {
    if (popup.hidden) return;
    if (e.key === 'Escape') {
      fecharPopup();
      return;
    }
    if (e.key === 'Tab') {
      // Mantém o foco dentro do pop-up.
      var itens = focaveis();
      if (!itens.length) return;
      var primeiro = itens[0];
      var ultimo = itens[itens.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }
  });

  var temMouse = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (temMouse) {
    // Desktop: mouse sai da janela pelo topo.
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0) abrirPopup();
    });
  } else {
    // Celular: já viu #planos e rolou rápido para cima.
    var JANELA_MS = 100;          // mede a velocidade a cada ~100 ms
    var VELOCIDADE_MIN = 2;       // px por ms (200 px em 100 ms)
    var DISTANCIA_MIN = 150;      // px subidos na janela

    var refY = window.pageYOffset;
    var refT = Date.now();

    window.addEventListener('scroll', function () {
      var y = window.pageYOffset;
      var t = Date.now();
      var dt = t - refT;
      if (dt < JANELA_MS) return;

      var subiu = refY - y;
      if (viuPlanos && subiu >= DISTANCIA_MIN && subiu / dt >= VELOCIDADE_MIN) {
        abrirPopup();
      }
      refY = y;
      refT = t;
    }, { passive: true });
  }
})();
