/* Ofertas por interação e retorno, sem inferir pagamento ou abandono. */
(function () {
  'use strict';
  var config = window.PNF_CAMPANHA || { ativa: false };
  var modal = document.getElementById('oferta-campanha');
  if (!modal) return;
  var basico = document.querySelector('[data-plano="basico"]');
  var completo = document.querySelector('[data-plano="completo"]');
  var titulo = document.getElementById('oferta-titulo');
  var aceitar = modal.querySelector('[data-oferta-aceitar]');
  var continuar = modal.querySelector('[data-oferta-basico]');
  var recusar = modal.querySelector('[data-oferta-recusar]');
  var chave = 'pnf_black_friday_v1';
  var sessao;
  var armazenamento = true;
  var focoAnterior;
  var bloqueados = [];
  var scrollAnterior = 0;
  var estiloAnterior;

  try {
    sessao = JSON.parse(window.sessionStorage.getItem(chave) || '{}');
    if (!sessao || typeof sessao !== 'object' || Array.isArray(sessao)) sessao = {};
    window.sessionStorage.setItem(chave, JSON.stringify(sessao));
  } catch (e) {
    // Sem persistência, seguimos aos checkouts regulares para evitar repetição.
    armazenamento = false;
    sessao = {};
  }

  function salvar() {
    try { window.sessionStorage.setItem(chave, JSON.stringify(sessao)); }
    catch (e) { armazenamento = false; }
    return armazenamento;
  }

  function compradorConfirmado() {
    // Reservado a uma integração confiável. Nunca ler compra de querystring.
    return window.PNF_COMPRA_CONFIRMADA === true;
  }

  function podeOfertar() {
    return config.ativa === true && armazenamento && !sessao.exibida &&
      !sessao.promocionalClicado && !compradorConfirmado();
  }

  function cliqueSimples(e) {
    return !e.defaultPrevented && e.button === 0 &&
      !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
  }

  function focaveis() {
    return Array.prototype.filter.call(modal.querySelectorAll('a[href], button'), function (el) {
      return !el.disabled && el.getClientRects().length > 0;
    });
  }

  function fechar(restaurarFoco) {
    if (modal.hidden) return;
    modal.hidden = true;
    bloqueados.forEach(function (item) { item.el.inert = item.inert; });
    bloqueados = [];
    document.body.classList.remove('sem-rolagem');
    document.body.style.position = estiloAnterior.position;
    document.body.style.top = estiloAnterior.top;
    document.body.style.width = estiloAnterior.width;
    window.scrollTo({ top: scrollAnterior, behavior: 'instant' });
    document.dispatchEvent(new Event('pnf:modal-fechado'));
    if (restaurarFoco !== false && focoAnterior && focoAnterior.isConnected) {
      focoAnterior.focus({ preventScroll: true });
    }
  }

  function abrir(fluxo) {
    if (!podeOfertar() || !modal.hidden) return false;
    sessao.exibida = true;
    sessao.retornoPendente = false;
    if (!salvar()) return false;
    titulo.textContent = fluxo === 'basico'
      ? 'Por mais R$ 5, leve o Presépio Completo'
      : 'Leve o Presépio Completo com R$ 8 de desconto';
    aceitar.textContent = fluxo === 'basico' ? 'QUERO O COMPLETO POR R$ 19,90' : 'QUERO POR R$ 19,90';
    // Reutiliza UTMs já propagadas por main.js; o destino vem da configuração.
    var destino = new URL(config.checkoutPromocional);
    new URL(aceitar.href).searchParams.forEach(function (valor, nome) {
      if (!destino.searchParams.has(nome)) destino.searchParams.append(nome, valor);
    });
    aceitar.href = destino.href;
    continuar.href = basico.href;
    continuar.hidden = fluxo !== 'basico';
    recusar.hidden = fluxo === 'basico';
    focoAnterior = document.activeElement;
    scrollAnterior = window.scrollY;
    estiloAnterior = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width };
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === modal || /^(SCRIPT|LINK|STYLE)$/.test(el.tagName)) return;
      bloqueados.push({ el: el, inert: el.inert });
      el.inert = true;
    });
    document.body.classList.add('sem-rolagem');
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollAnterior + 'px';
    document.body.style.width = '100%';
    modal.hidden = false;
    document.dispatchEvent(new Event('pnf:modal-aberto'));
    aceitar.focus({ preventScroll: true });
    return true;
  }

  basico.addEventListener('click', function (e) {
    if (cliqueSimples(e) && podeOfertar() && abrir('basico')) e.preventDefault();
  });

  completo.addEventListener('click', function (e) {
    if (!cliqueSimples(e) || !podeOfertar()) return;
    sessao.retornoPendente = true;
    salvar();
    // A navegação nativa segue diretamente ao Completo regular.
  });

  aceitar.addEventListener('click', function () {
    sessao.promocionalClicado = true;
    sessao.exibida = true;
    sessao.retornoPendente = false;
    salvar();
    fechar(false);
  });
  continuar.addEventListener('click', function () { fechar(false); });
  recusar.addEventListener('click', function () { fechar(); });
  modal.querySelector('[data-oferta-fechar]').addEventListener('click', function () { fechar(); });
  modal.addEventListener('click', function (e) { if (e.target === modal) fechar(); });

  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); fechar(); }
    if (e.key !== 'Tab') return;
    var itens = focaveis();
    var primeiro = itens[0];
    var ultimo = itens[itens.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  });
  document.addEventListener('focusin', function (e) {
    if (!modal.hidden && !modal.contains(e.target)) aceitar.focus({ preventScroll: true });
  });

  function aoRetornar() {
    if (!sessao.retornoPendente) return;
    sessao.retornoPendente = false;
    salvar();
    abrir('retorno');
  }
  // pageshow cobre Voltar com e sem bfcache, sem interferir no histórico.
  window.addEventListener('pageshow', aoRetornar);
  window.addEventListener('pagehide', function () { fechar(false); });
  window.addEventListener('pnf:compra-confirmada', function () {
    if (!compradorConfirmado()) return;
    sessao.retornoPendente = false;
    salvar();
    fechar();
  });
})();
