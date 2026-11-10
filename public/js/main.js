/* ==========================================================
   Presépio Noite Feliz · comportamentos da página
   1. Repasse de UTM para os links de checkout
   2. Header, botão fixo do celular, barra de progresso, voltar ao topo
   3. Animação de entrada [data-reveal]
   4. Faixa das 12 peças
   5. Pop-up de saída (uma vez por sessão)
   Cada parte só roda se os elementos existirem na página.
   ========================================================== */
(function () {
  'use strict';

  var doc = document;
  var raiz = doc.documentElement;
  var reduzido = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var temIO = 'IntersectionObserver' in window;

  function cada(lista, fn) { Array.prototype.forEach.call(lista, fn); }

  /* ---------- 1. Repasse de UTM ----------
     Acrescenta os parâmetros da URL da página em todo link com
     data-checkout. Parâmetros que o link já tem são mantidos. */
  (function repassarParametros() {
    if (!window.location.search || window.location.search.length < 2) return;
    if (typeof URLSearchParams === 'undefined') return;

    var daPagina = new URLSearchParams(window.location.search);

    cada(doc.querySelectorAll('a[data-checkout]'), function (link) {
      var href = link.getAttribute('href') || '';

      var posHash = href.indexOf('#');
      var hash = posHash >= 0 ? href.slice(posHash) : '';
      var semHash = posHash >= 0 ? href.slice(0, posHash) : href;

      var posQuery = semHash.indexOf('?');
      var base = posQuery >= 0 ? semHash.slice(0, posQuery) : semHash;
      var doLink = new URLSearchParams(posQuery >= 0 ? semHash.slice(posQuery + 1) : '');

      var chavesDoLink = {};
      doLink.forEach(function (_v, chave) { chavesDoLink[chave] = true; });

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
  })();

  /* ---------- 2. Elementos fixos ---------- */
  var topo = doc.getElementById('topo');
  var hero = doc.getElementById('inicio');
  var planos = doc.getElementById('planos');
  var barra = doc.getElementById('barra-planos');
  var progresso = doc.querySelector('.progresso__barra');
  var voltar = doc.getElementById('voltar-topo');
  var popup = doc.getElementById('popup-saida');

  var estado = { heroPassou: false, planosVisivel: false, viuPlanos: false, popupAberto: false };

  function mostrar(el, visivel) {
    if (!el) return;
    el.classList.toggle('is-visivel', visivel);
    el.setAttribute('aria-hidden', visivel ? 'false' : 'true');
    var focavel = el.matches('a, button') ? el : el.querySelector('a, button');
    if (focavel) focavel.setAttribute('tabindex', visivel ? '0' : '-1');
  }

  function atualizarFixos() {
    if (topo) topo.classList.toggle('is-escondido', estado.planosVisivel);
    mostrar(barra, estado.heroPassou && !estado.planosVisivel && !estado.popupAberto);
  }

  if (temIO) {
    if (hero) {
      new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          estado.heroPassou = !e.isIntersecting && e.boundingClientRect.top < 0;
        });
        atualizarFixos();
      }).observe(hero);
    }
    if (planos) {
      new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          estado.planosVisivel = e.isIntersecting;
          if (e.isIntersecting) estado.viuPlanos = true;
        });
        atualizarFixos();
      }).observe(planos);
    }
  }

  // Rolagem: barra de progresso, voltar ao topo e subida rápida (pop-up no celular).
  var quadroAgendado = false;
  var aoSubirRapido = null; // definido na parte 5

  function quadro() {
    quadroAgendado = false;
    var y = window.pageYOffset;
    var altura = window.innerHeight;

    if (progresso) {
      var maximo = raiz.scrollHeight - altura;
      var fracao = maximo > 0 ? Math.min(1, Math.max(0, y / maximo)) : 0;
      progresso.style.transform = 'scaleX(' + fracao.toFixed(4) + ')';
    }
    if (voltar) mostrar(voltar, y > altura * 2);
    if (aoSubirRapido) aoSubirRapido(y);
  }

  function agendarQuadro() {
    if (quadroAgendado) return;
    quadroAgendado = true;
    window.requestAnimationFrame(quadro);
  }

  window.addEventListener('scroll', agendarQuadro, { passive: true });
  window.addEventListener('resize', agendarQuadro);
  quadro();

  if (voltar) {
    voltar.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduzido ? 'auto' : 'smooth' });
      var alvo = doc.querySelector('.topo__logo') || doc.body;
      if (alvo.focus) alvo.focus({ preventScroll: true });
    });
  }

  /* ---------- 3. Animação de entrada ---------- */
  var revelaveis = doc.querySelectorAll('[data-reveal]');
  if (reduzido || !temIO) {
    cada(revelaveis, function (el) { el.classList.add('is-revelado'); });
  } else {
    var observadorReveal = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-revelado');
        observadorReveal.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    cada(revelaveis, function (el) { observadorReveal.observe(el); });
  }

  /* ---------- 4. Faixa das 12 peças ----------
     Duplica os cards de cada fileira (cópias escondidas do leitor de tela)
     e ajusta a duração para andar ~40px por segundo. Sem JS ou com
     movimento reduzido, a faixa fica parada com rolagem horizontal. */
  var VELOCIDADE = 40; // px por segundo
  var faixas = doc.querySelectorAll('.faixa');

  function ajustarDuracao() {
    cada(doc.querySelectorAll('.faixa.is-animada .faixa__trilho'), function (trilho) {
      var metade = trilho.scrollWidth / 2;
      if (metade > 0) trilho.style.setProperty('--duracao', (metade / VELOCIDADE).toFixed(1) + 's');
    });
  }

  if (faixas.length && !reduzido) {
    cada(faixas, function (faixa) {
      cada(faixa.querySelectorAll('.faixa__trilho'), function (trilho) {
        var originais = Array.prototype.slice.call(trilho.children);
        originais.forEach(function (item) {
          var copia = item.cloneNode(true);
          copia.setAttribute('aria-hidden', 'true');
          cada(copia.querySelectorAll('img'), function (img) { img.setAttribute('alt', ''); });
          trilho.appendChild(copia);
        });
      });
      faixa.classList.add('is-animada');
    });

    ajustarDuracao();
    var esperaResize = null;
    window.addEventListener('resize', function () {
      clearTimeout(esperaResize);
      esperaResize = setTimeout(ajustarDuracao, 150);
    });
    window.addEventListener('load', ajustarDuracao);

    // Dentro da faixa, o lazy do navegador só carrega a foto quando ela já
    // está entrando na tela. Quando a faixa se aproxima, carrega todas antes.
    var blocoFaixas = doc.querySelector('.faixas');
    if (blocoFaixas && temIO) {
      var observadorFaixa = new IntersectionObserver(function (entradas) {
        if (!entradas.some(function (e) { return e.isIntersecting; })) return;
        cada(blocoFaixas.querySelectorAll('img[loading="lazy"]'), function (img) { img.loading = 'eager'; });
        observadorFaixa.disconnect();
      }, { rootMargin: '600px 0px' });
      observadorFaixa.observe(blocoFaixas);
    }

    // Pausa enquanto o dedo estiver em cima da faixa.
    cada(doc.querySelectorAll('.faixa__linha'), function (linha) {
      linha.addEventListener('touchstart', function () { linha.classList.add('is-tocando'); }, { passive: true });
      ['touchend', 'touchcancel'].forEach(function (tipo) {
        linha.addEventListener(tipo, function () { linha.classList.remove('is-tocando'); }, { passive: true });
      });
    });
  }

  /* ---------- 5. Pop-up de saída ---------- */
  if (!popup) return;

  var CHAVE_POPUP = 'pnf_popup_saida_visto';
  var vistoNaMemoria = false;

  function popupJaVisto() {
    if (vistoNaMemoria) return true;
    try {
      return window.sessionStorage.getItem(CHAVE_POPUP) === '1';
    } catch (e) {
      return false;
    }
  }

  function marcarPopupVisto() {
    vistoNaMemoria = true;
    try {
      window.sessionStorage.setItem(CHAVE_POPUP, '1');
    } catch (e) { /* navegação privada ou armazenamento bloqueado */ }
  }

  var focoAnterior = null;
  var carregouEm = Date.now();
  var ESPERA_MINIMA_MS = 3000; // não abre logo que a página carrega

  function focaveis() {
    return popup.querySelectorAll('a[href], button:not([disabled])');
  }

  function abrirPopup() {
    if (estado.popupAberto || popupJaVisto()) return;
    if (Date.now() - carregouEm < ESPERA_MINIMA_MS) return;

    marcarPopupVisto();
    estado.popupAberto = true;
    focoAnterior = doc.activeElement;
    popup.hidden = false;
    doc.body.classList.add('sem-rolagem');
    atualizarFixos();

    var botao = popup.querySelector('[data-checkout]') || focaveis()[0];
    if (botao) botao.focus();
  }

  function fecharPopup() {
    if (!estado.popupAberto) return;
    estado.popupAberto = false;
    popup.hidden = true;
    doc.body.classList.remove('sem-rolagem');
    atualizarFixos();
    if (focoAnterior && typeof focoAnterior.focus === 'function') focoAnterior.focus();
  }

  // Fecha com o X, com "Não, obrigada", com clique fora e com Esc.
  popup.addEventListener('click', function (e) {
    if (e.target === popup || e.target.closest('[data-fechar-popup]')) fecharPopup();
  });

  doc.addEventListener('keydown', function (e) {
    if (!estado.popupAberto) return;
    if (e.key === 'Escape') {
      fecharPopup();
      return;
    }
    if (e.key === 'Tab') {
      var itens = focaveis();
      if (!itens.length) return;
      var primeiro = itens[0];
      var ultimo = itens[itens.length - 1];
      if (e.shiftKey && doc.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && doc.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }
  });

  var temMouse = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  if (temMouse) {
    // Desktop: mouse sai da janela pelo topo.
    doc.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0) abrirPopup();
    });
  } else {
    // Celular: já viu #planos e rolou rápido para cima.
    var JANELA_MS = 100;     // mede a velocidade a cada ~100 ms
    var VELOCIDADE_MIN = 2;  // px por ms (200 px em 100 ms)
    var DISTANCIA_MIN = 150; // px subidos na janela
    var refY = window.pageYOffset;
    var refT = Date.now();

    aoSubirRapido = function (y) {
      var t = Date.now();
      var dt = t - refT;
      if (dt < JANELA_MS) return;
      var subiu = refY - y;
      if (estado.viuPlanos && subiu >= DISTANCIA_MIN && subiu / dt >= VELOCIDADE_MIN) abrirPopup();
      refY = y;
      refT = t;
    };
  }
})();
