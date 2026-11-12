(() => {
  const section = document.querySelector('#por-dentro');
  const modal = document.querySelector('.guia-modal');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      section.querySelectorAll('.guia-card').forEach((card, i) => {
        card.style.setProperty('--ordem', i);
        if (!reduced.matches) card.classList.add('guia-revelar');
      });
      observer.disconnect();
    }, {threshold: .12});
    observer.observe(section);
  }
  if (!modal || typeof modal.showModal !== 'function') return;
  const viewport = modal.querySelector('.guia-viewport');
  const image = viewport.querySelector('img');
  const zoom = modal.querySelector('[data-guia-zoom]');
  const close = modal.querySelector('[data-guia-fechar]');
  let origin, closing = false, previousOverflow;
  function finish() {
    modal.close(); modal.classList.remove('is-aberto'); closing = false;
    document.body.style.overflow = previousOverflow;
    image.removeAttribute('src');
    origin?.focus({preventScroll: true});
  }
  function dismiss() {
    if (closing || !modal.open) return;
    closing = true; modal.classList.remove('is-aberto');
    if (reduced.matches) finish(); else setTimeout(finish, 210);
  }
  section.querySelectorAll('[data-amostra]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); origin = link;
      image.alt = link.querySelector('img').alt;
      image.src = link.href;
      modal.querySelector('h2').textContent = link.querySelector('strong').textContent;
      viewport.classList.remove('is-zoom'); zoom.setAttribute('aria-pressed', 'false'); zoom.textContent = 'Ampliar +';
      previousOverflow = document.body.style.overflow;
      modal.showModal(); document.body.style.overflow = 'hidden';
      viewport.scrollTo(0, 0); close.focus();
      requestAnimationFrame(() => modal.classList.add('is-aberto'));
    });
  });
  close.addEventListener('click', dismiss);
  modal.addEventListener('cancel', event => {event.preventDefault(); dismiss();});
  modal.addEventListener('click', event => {
    const rect = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dismiss();
  });
  zoom.addEventListener('click', () => {
    const active = viewport.classList.toggle('is-zoom');
    zoom.setAttribute('aria-pressed', String(active)); zoom.textContent = active ? 'Ajustar −' : 'Ampliar +';
  });
  modal.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const targets = [zoom, close, viewport];
    const index = targets.indexOf(document.activeElement);
    if (event.shiftKey && index <= 0) {event.preventDefault(); viewport.focus();}
    else if (!event.shiftKey && (index === targets.length - 1 || index === -1)) {event.preventDefault(); zoom.focus();}
  });
})();
