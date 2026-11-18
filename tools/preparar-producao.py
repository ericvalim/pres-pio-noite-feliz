"""Gera uma pasta de publicação por lista permitida, sem modificar os originais."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import re
import shutil
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'public'
OUTPUT = ROOT / 'producao'

class Assets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ('src', 'href'):
            if attrs.get(key):
                self.urls.add(attrs[key])
        for key in ('srcset', 'imagesrcset'):
            for item in attrs.get(key, '').split(','):
                if item.strip():
                    self.urls.add(item.strip().split()[0])

pages = {}
for name in ('index.html', 'termos.html', 'privacidade.html'):
    text = (SOURCE / name).read_text(encoding='utf-8')
    if name == 'index.html':
        text, count = re.subn(r'<!-- PREVIEW HELENA \(teste local\).*?</script>', '', text, count=1, flags=re.S)
        assert count in (0, 1)
        text, count = re.subn(r'<section\b[^>]*id="por-dentro"[^>]*>.*?</section>', '', text, count=1, flags=re.S)
        assert count == 1
        text = re.sub(r'<template\b.*?</template>', '', text, flags=re.S)
        # A autorização para venda de peças ainda não foi definida pelo titular.
        text, count = re.subn(r'<details>\s*<summary>“Posso vender as peças que eu fizer\?”.*?</details>', '', text, count=1, flags=re.S)
        assert count == 1
    # Comentários de rascunho e instruções internas não integram a publicação.
    text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
    text = text.replace('[RAZÃO SOCIAL] · CNPJ [CNPJ] · [ENDEREÇO] · ', 'Ateliê Crochêtando · ')
    text = text.replace('[RAZÃO SOCIAL] · [ENDEREÇO] · ', 'Ateliê Crochêtando · ')
    text = text.replace('Esta política explica como [RAZÃO SOCIAL], CNPJ [CNPJ], trata', 'Esta política explica como o Ateliê Crochêtando trata')
    text = text.replace(' e dos produtos complementares oferecidos neste site, vendidos por [RAZÃO SOCIAL], CNPJ [CNPJ], com endereço em [ENDEREÇO].', ', nas edições Básico e Completo, oferecido pelo Ateliê Crochêtando.')
    text = re.sub(r'\s*<p>Última atualização: \[DATA\]</p>', '', text)
    text = re.sub(r'\s*<li>Venda das peças feitas à mão a partir do guia: \[REGRA DE VENDA DAS PEÇAS\].</li>', '', text)
    text = text.replace('Textos, fotos, receitas e o design do guia pertencem a [TITULAR DOS DIREITOS] e são protegidos pela Lei 9.610/1998.', 'Não é permitido reproduzir ou distribuir o conteúdo do guia sem autorização do titular dos direitos.')
    text = re.sub(r'\s*<p class="caixa-aviso">Este texto é um modelo\..*?</p>', '', text)
    if name == 'privacidade.html':
        text = re.sub(r'\s*<li><strong>Cloudflare Web Analytics:</strong>.*?</li>', '', text)
        text = text.replace('o Pixel da Meta registra visitas e compras para medir anúncios.', 'o Pixel da Meta registra visitas à página de vendas para medir anúncios.')
    assert not re.search(r'\{\{|\[[A-ZÁÉÍÓÚÂÊÔÃÕÇ][^\]]*\]', text), name
    assert not re.search(r'preview=helena|preview-helena|data-preview|previa-|por-dentro|upsell|downsell', text, re.I), name
    pages[name] = text

# Copia somente dependências efetivamente referenciadas pelas três páginas.
assets = set()
for text in pages.values():
    parser = Assets()
    parser.feed(text)
    for url in parser.urls:
        parsed = urlsplit(url)
        if parsed.scheme or parsed.netloc or not parsed.path or parsed.path == './':
            continue
        relative = parsed.path.lstrip('/')
        if relative not in pages:
            assets.add(relative)
assets.add('_headers')
assert all((SOURCE / asset).is_file() for asset in assets)
assert all((SOURCE / asset).resolve().is_relative_to(SOURCE.resolve()) for asset in assets)
assert all(asset.startswith(('img/', 'css/', 'js/')) or asset == '_headers' for asset in assets)
for asset in assets:
    assert not re.search(r'preview-helena|Copia|\.pdf$', asset, re.I)
    data = (SOURCE / asset).read_bytes()
    assert not data.startswith(b'%PDF-')

if OUTPUT.exists():
    backup = ROOT / '_fora-do-site' / ('producao-' + datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
    assert OUTPUT.resolve().is_relative_to(ROOT.resolve())
    assert backup.resolve().is_relative_to(ROOT.resolve())
    if backup.exists():
        raise SystemExit('Backup de produção já existe; revise antes de gerar novamente.')
    backup.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.rename(backup)
OUTPUT.mkdir()
for name, text in pages.items():
    (OUTPUT / name).write_text(text, encoding='utf-8', newline='\n')
for asset in sorted(assets):
    target = OUTPUT / asset
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SOURCE / asset, target)
print(f'Produção preparada: {len(pages)} páginas e {len(assets)} dependências. Originais preservados.')
