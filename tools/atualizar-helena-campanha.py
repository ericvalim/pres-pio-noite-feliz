"""Migração local: restaura imagens originais e troca o popup antigo."""
from pathlib import Path
import re
import shutil

root = Path(__file__).resolve().parent.parent
public = root / 'public'
backup = root / '_fora-do-site' / 'antes-helena-black-friday'
backup.mkdir(parents=True, exist_ok=False)
for name in ('index.html', 'js/main.js', 'css/style.css'):
    dest = backup / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(public / name, dest)

text = (public / 'index.html').read_text(encoding='utf-8')
text = re.sub(r'<!-- PREVIEW HELENA \(teste local\).*?</script>', '', text, count=1, flags=re.S)
text = re.sub(r'  <!-- PREVIEW HELENA: conteúdo do teste.*?<!-- CF ANALYTICS -->', '', text, flags=re.S)
text = text.replace('<link rel="stylesheet" href="css/style.css">', '<link rel="stylesheet" href="css/style.css">\n  <link rel="stylesheet" href="css/helena.css">\n  <link rel="stylesheet" href="css/ofertas.css">')
text = text.replace('data-checkout href="https://pay.cakto.com.br/5cvwvfi_1309610"', 'data-checkout data-plano="basico" href="https://pay.cakto.com.br/5cvwvfi_1309610"')
text = text.replace('data-checkout href="https://pay.cakto.com.br/ge3iskx_1309623"', 'data-checkout data-plano="completo" href="https://pay.cakto.com.br/ge3iskx_1309623"')
text = text.replace('<h2 id="titulo-quem" data-reveal>Quem está <span class="destaque">por trás do presépio</span></h2>', '''<figure class="helena-retrato">
        <img src="img/helena/helena-duarte-apresentacao.jpg" width="382" height="512" loading="lazy" decoding="async" alt="Helena, avatar da marca Ateliê Crochêtando, em uma cena ilustrativa de ateliê">
      </figure>
      <h2 id="titulo-quem" data-reveal>Conheça a Helena, <span class="destaque">avatar da nossa marca.</span></h2>''')
text = text.replace('A Crochêtando é uma página feita para quem ama crochê.', 'Helena é a avatar do Ateliê Crochêtando e aparece nas imagens ilustrativas da marca. Guias de amigurumi para acompanhar sua criatividade, ponto a ponto.')
pattern = r'<img class="capa-guia".*?alt="Capa do guia Presépio Noite Feliz">'
text, count = re.subn(pattern, '''<figure class="helena-cena helena-cena--funciona">
          <img src="img/helena/helena-duarte-como-funciona.jpg" width="1376" height="768" loading="lazy" decoding="async" alt="Cena ilustrativa com Helena, avatar da marca, com fios e um caderno de crochê">
        </figure>''', text, count=1, flags=re.S)
assert count == 1
text = text.replace('<section class="painel centro" id="fechamento" aria-labelledby="titulo-fechamento">', '''<section class="painel centro" id="fechamento" aria-labelledby="titulo-fechamento">
      <figure class="helena-final">
        <img src="img/helena/helena-duarte-chamada-final.jpg" width="1376" height="768" loading="lazy" decoding="async" alt="Helena, avatar da marca, em uma cena ilustrativa no ateliê">
      </figure>''')
modal = '''<div class="popup" id="oferta-campanha" role="dialog" aria-modal="true" aria-labelledby="oferta-titulo" aria-describedby="oferta-preco" hidden>
    <div class="popup__caixa">
      <button type="button" class="popup__fechar" data-oferta-fechar aria-label="Fechar oferta">
        <svg width="22" height="22" aria-hidden="true"><use href="#i-fechar"/></svg>
      </button>
      <p class="oferta__selo">BLACK FRIDAY</p>
      <h2 class="popup__titulo" id="oferta-titulo">Por mais R$ 5, leve o Presépio Completo</h2>
      <p class="oferta__preco" id="oferta-preco">De <s>R$ 27,90</s> por <strong>R$ 19,90</strong></p>
      <a class="btn btn--bloco" data-checkout data-oferta-aceitar href="https://pay.cakto.com.br/xhysbvp">QUERO O COMPLETO POR R$ 19,90</a>
      <div class="oferta__secundaria"><a class="link-texto" data-checkout data-oferta-basico href="https://pay.cakto.com.br/5cvwvfi_1309610">Continuar com o básico por R$ 14,90</a></div>
      <div class="oferta__secundaria"><button type="button" class="link-texto" data-oferta-recusar hidden>Agora não</button></div>
    </div>
  </div>

  <script src="js/main.js" defer></script>
  <script src="js/campanha-config.js" defer></script>
  <script src="js/ofertas.js" defer></script>'''
text, count = re.subn(r'<div class="popup" id="popup-saida".*?<script src="js/main.js" defer></script>', lambda _: modal, text, count=1, flags=re.S)
assert count == 1
(public / 'index.html').write_text(text, encoding='utf-8')

main = (public / 'js/main.js').read_text(encoding='utf-8')
main = main.split('  /* ---------- 5. Pop-up de saída ---------- */')[0] + '})();\n'
main = main.replace('   5. Pop-up de saída (uma vez por sessão)\n', '')
main = main.replace("  var popup = doc.getElementById('popup-saida');\n", '')
main = main.replace('  var aoSubirRapido = null; // definido na parte 5\n', '')
main = main.replace('    if (aoSubirRapido) aoSubirRapido(y);\n', '')
main = main.replace('// Rolagem: barra de progresso, voltar ao topo e subida rápida (pop-up no celular).', '// Rolagem: barra de progresso e voltar ao topo.')
main = main.replace("  if (temIO) {", "  doc.addEventListener('pnf:modal-aberto', function () { estado.popupAberto = true; atualizarFixos(); });\n  doc.addEventListener('pnf:modal-fechado', function () { estado.popupAberto = false; atualizarFixos(); });\n\n  if (temIO) {", 1)
(public / 'js/main.js').write_text(main, encoding='utf-8')
css = (public / 'css/preview-helena.css').read_text(encoding='utf-8')
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S).replace('.preview-helena ', '')
(public / 'css/helena.css').write_text('/* Helena: avatar da marca. Layout original da apresentação. */\n' + css, encoding='utf-8')
print('Helena restaurada e popup antigo substituído. Backup em', backup)
