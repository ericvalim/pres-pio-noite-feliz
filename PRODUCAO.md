# Versão de produção — publicada em https://ateliecrochetando.com.br/

Tecnologia: HTML, CSS e JavaScript puros, sem framework, dependências de execução ou build. A página inicial é `producao/index.html`. O CSS foi copiado integralmente da página atual para preservar o layout.

**Publicação:** o Cloudflare serve a pasta `producao/` (`wrangler.jsonc` → `assets.directory`). Um `git push` na `main` publica o site em cerca de 1 minuto.

> **Atenção:** desde a revista digital, edite `producao/` diretamente e replique em `public/`. **Não rode `tools/preparar-producao.py`**: ele apaga a seção de prévias (`#por-dentro`), remove a resposta final de "Posso vender as peças que eu fizer?" e trava enquanto houver campos entre colchetes em `public/`. Ajuste o script antes de voltar a usá-lo.

## Visualizar

Na raiz do projeto:

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory producao
```

Abra http://127.0.0.1:8000/ e encerre com Ctrl+C.

## Pasta exata para publicar

`C:\Users\Usuario\presépio-noite-feliz\producao`

Enviar somente o conteúdo dessa pasta, sem comando de build. Nunca publicar a raiz do projeto ou `public/`, que ficou como fonte original de trabalho.

A pasta de produção contém `index.html`, `termos.html`, `privacidade.html`, `_headers`, os estilos `style.css`, `helena.css`, `ofertas.css` e `previas.css`, os scripts `main.js`, `meta-pixel.js`, `campanha-config.js`, `ofertas.js` e `previas.js`, e as imagens referenciadas nessas páginas (incluindo `img/previas/`).

## Revista digital (novembro de 2026)

O guia passou a ser apresentado como **revista digital em PDF**, com bônus de páginas para colorir. Mudanças aplicadas em `producao/` e `public/`:

- **Capa:** o mockup de livro foi trocado por `img/previas/capa-completo` (480/960) no hero e nos planos, com moldura de revista (classe `.capa-revista` em `previas.css`: cantos de 8 px, sombra suave, inclinação de −2°). Alt: "Capa da revista digital Presépio Noite Feliz — Edição Completa". O preload do hero aponta para a capa nova.
- **Prévias ("Veja por dentro da revista"):** 5 páginas reais, sem número de página, em carrossel no celular e 5 colunas no desktop:
  - `nesta-edicao` — Índice com as 12 peças (Completo)
  - `abertura-maria` — Cada peça abre com foto e a sua história (Básico e Completo)
  - `receita-maria` — Receita carreira por carreira, com contagem de pontos e caixinhas para marcar (Básico e Completo)
  - `passo-a-passo-manjedoura` — Montagem com fotos das etapas (Básico e Completo)
  - `colorir-reis` — Bônus exclusivo do Completo: páginas para colorir com os netos

  O aviso abaixo das prévias diz que as imagens das peças são ilustrativas e que o conteúdo depende da versão escolhida. As imagens ficam em `img/previas/` (480 e 960 px). As prévias antigas (`pontos`, `receita`, `montagem`, `cena`, com as páginas 9, 25, 36 e 211) foram removidas e continuam no histórico do git. Origem dos arquivos: `_fora-do-site/img/previas/` (`capa-basico` não é usada).
- **Ampliar:** o toque abre a página na versão 960 px. O botão Ampliar vai até 960 px (`.guia-viewport.is-zoom img`), o maior tamanho disponível. Para uma ampliação maior e nítida, gere versões de 1800 px a partir dos originais da revista.
- **Planos:**
  - Completo: "BÔNUS: 3 páginas para colorir com os netos", logo depois das 12 peças, com o selo dourado "EXCLUSIVO DO COMPLETO" (`.selo-exclusivo` em `previas.css`).
  - Básico inclui: Sagrada Família (Menino Jesus com manjedoura, Maria e José), pontos básicos com foto, lista de compras das 3 peças, montagem da Sagrada Família e guia de fios e cores das 3 peças.
  - Básico não inclui: "Reis Magos, Anjo, Pastor, animais (ovelha, boi e burrinho), Estrela de Belém e as páginas para colorir".
  - Preços, pagamento único, garantia, entrega por e-mail e links da Cakto não mudaram.
- **FAQ:** nova pergunta "É uma revista impressa?" (revista digital em PDF, enviada por e-mail, lida no celular ou impressa em casa). A resposta de entrega agora fala em "revista digital em PDF".
- **Textos:** "revista digital em PDF" aparece em 3 lugares: abaixo do botão do hero, na faixa de números e na resposta de entrega.
- **Rodapé:** a linha do vendedor ("Vendido por … · CNPJ …") foi removida até existirem dados reais. No celular, a folga inferior do rodapé passou de 120 para 176 px, para o botão voltar ao topo não cobrir o "© 2026".

## Remoções da versão pública

- Upsell, downsell e agradecimento não foram incluídos. Nenhum link público aponta para essas páginas.
- A antiga seção oculta "Veja por dentro" (mosaico `previa-1` a `previa-6`, sem imagens) foi substituída pelas prévias da revista descritas acima.
- O mecanismo de prévia e seus templates não foram incluídos. As três fotos originais da Helena (apresentação, como funciona e chamada final) foram restauradas diretamente no HTML, com os estilos originais adaptados em `helena.css`, sem depender da URL. Helena é identificada como avatar da marca, sem biografia ou autoria humana atribuída.
- Imagens duplicadas “Copia”, PDFs, fontes do produto pago, receitas, rascunhos e arquivos internos não foram incluídos.
- Comentários de rascunho e placeholders não integram o HTML de produção.

Fontes de trabalho em `public/` e PDFs em `pdf/`, fora de `producao/`. O HTML e o JavaScript anteriores à campanha foram preservados em `_fora-do-site/antes-helena-black-friday/`. A produção anterior foi preservada em `_fora-do-site/producao-antes-campanha/`. A geração usa uma lista permitida no script interno `tools/preparar-producao.py`; novas gerações movem a produção anterior para um backup datado em `_fora-do-site/` antes de criar a nova pasta.

## Configurações mantidas

- Básico: R$ 14,90 — https://pay.cakto.com.br/5cvwvfi_1309610
- Completo regular no card: R$ 27,90 — https://pay.cakto.com.br/ge3iskx_1309623
- Completo Black Friday, apenas no modal: R$ 19,90 — https://pay.cakto.com.br/xhysbvp
- Suporte: timing.agenciadigital@gmail.com
- Domínio previsto: https://ateliecrochetando.com.br/
- Pixel: 2573332176467688, com uma inicialização e um PageView por documento e proteção contra execução repetida. Nenhum Purchase é disparado pelo site.

## Pendências de conteúdo antes da publicação

Os marcadores foram retirados da versão pública, mas os dados desconhecidos não foram inventados. A preparação técnica não encerra estas pendências:

1. Dados do responsável (Decreto 7.962/2013, art. 2º): confirmar razão social ou nome do vendedor, CPF/CNPJ e endereço físico. Por enquanto, rodapés e apresentação usam apenas a marca Ateliê Crochêtando e o suporte confirmado. Com os dados em mãos, recolocar no rodapé de `producao/index.html` e `public/index.html` a linha "Vendido por [RAZÃO SOCIAL] · CNPJ [NÚMERO]" (com endereço), e completar termos e privacidade.
2. Termos: confirmar o titular dos direitos. A venda das peças prontas foi autorizada em produção (FAQ "Posso vender as peças que eu fizer?"), mas em `public/index.html` essa resposta ainda é o rascunho `[DEFINIR…]`. A proibição de copiar, revender ou compartilhar o PDF permanece.
3. Termos e privacidade: definir as datas da versão aprovada e revisar o conteúdo final. As linhas com datas provisórias foram retiradas, sem usar uma data fictícia.
4. Privacidade: confirmar a identificação do responsável/controlador e o tratamento de cookies adotado. A referência a Cloudflare Analytics foi retirada porque não está instalado; a descrição do Pixel passou a mencionar visitas à página de vendas, conforme o código atual.
5. Domínio e conferências: o site está no ar em `ateliecrochetando.com.br`, mas `www.ateliecrochetando.com.br` não existe no DNS. Criar o registro `www` no Cloudflare e redirecionar para o domínio sem www. Continuam pendentes a conferência dos checkouts na Cakto e do recebimento do Pixel no domínio publicado.
6. Prévia da receita: `receita-maria` mostra as carreiras C1 a C17 da cabeça da Maria (parte 1 de 4). Isso foi intencional para a página de vendas. Se não quiser essa parte visível, troque por uma versão com as carreiras borradas ou retire essa prévia.

## Validação realizada

- Conferidas as três páginas, todos os arquivos referenciados em `src`, `href`, `srcset` e `imagesrcset`, além dos fragmentos internos.
- `style.css` mantido; estilos específicos de Helena e do modal ficam em arquivos adicionais, preservando as posições usadas originalmente na prévia.
- Servidor local apontado somente para `producao/`: páginas e dependências retornaram HTTP 200. Upsell, downsell, agradecimento, arquivos da prévia, caminhos dos PDFs e README retornaram 404. O servidor foi encerrado após o teste.
- Conferidos os checkouts e a ausência de placeholders, links provisórios e arquivos com assinatura PDF na pasta de produção.
- Testes automatizados no Chrome instalado, via `tools/testar-ofertas.mjs`, com destinos de checkout simulados e chamadas externas bloqueadas. Nenhuma compra ou chamada real à Cakto foi feita. Foram cobertos os dois fluxos, aceite, continuação no Básico, recusa, X, Escape, clique fora, retorno com documento novo, repetição de pageshow e controle compartilhado da sessão.
- Tamanhos testados: 1280×900, 390×844, 320×568 e 844×390. Conferidos foco inicial/restaurado, Tab/Shift+Tab, isolamento do fundo com inert, bloqueio/restauração da rolagem, dimensões do modal, ausência de rolagem horizontal e decodificação das três fotos. Capturas locais ficam em `_fora-do-site/validacao-black-friday/`, fora da publicação.
- Conferidos campanha desligada, comprador confirmado fornecido por integração, confirmação com modal aberto, armazenamento bloqueado, ausência de abertura por tempo/saída do mouse, PageView único mesmo com inclusão repetida do Pixel e ausência de Purchase por clique.
- Continuam pendentes a confirmação dos eventos na Meta e das ofertas na conta Cakto. Os testes em navegador bloquearam fontes remotas e serviços externos; o recebimento de eventos não foi testado.

### Validação da revista digital

- `node tools/conferir-revista.mjs producao` (ou `public`): servidor local e Chrome headless em 390 e 1366 px. Confere as 7 imagens de `img/previas/`, a ausência de rolagem horizontal, os 4 links da Cakto, as 5 prévias, a ausência de "página N" no texto e nos alts, e a ampliação com a imagem de 960 px. As capturas ficam em `_fora-do-site/revista-conferencia/<pasta>/`.
- `node tools/conferir-publicado-celular.mjs`: testa o site publicado num Chrome emulando celular (390×844, densidade 3x, toque), com o Pixel bloqueado e sem clicar em checkout. Confere as imagens, a largura, o carrossel, a ampliação, os planos (selo exclusivo, sem "1 página para colorir"), a FAQ e o rodapé. As capturas ficam em `_fora-do-site/revista-conferencia/publicado/`. O único erro de JS esperado é o do Pixel bloqueado.
- Testes desatualizados: `tools/testar-previas.mjs` e `tools/conferir-previas-publicadas.mjs` ainda esperam as 4 prévias antigas e falham.

## Controle da campanha

O único interruptor é `ativa` em `js/campanha-config.js`. Para desligar, use `ativa: false` em `producao/js/campanha-config.js` (e em `public/js/campanha-config.js`, para manter as duas cópias iguais), depois faça commit e push. Não rode `tools/preparar-producao.py` (veja o aviso no início). Não é necessário alterar os cards ou a lógica do modal.

O desconto aparece no máximo uma vez por sessão da aba (`sessionStorage`), compartilhado pelos dois fluxos. A exibição já consome a oferta, inclusive X, Escape ou recusa. O clique promocional também é registrado. Sem armazenamento disponível, a campanha não abre e os links regulares continuam funcionando. Os parâmetros de campanha são repassados aos checkouts.

O primeiro clique no Completo não é interceptado: segue ao preço regular e registra somente a possibilidade de recuperação no retorno via `pageshow`. Não existe inferência de abandono ou de pagamento, alteração de histórico, interceptação do fechamento, contagem regressiva ou prazo fictício.

Não há integração administrativa ou servidor que confirme uma compra neste site estático. Uma integração confiável futura pode definir `window.PNF_COMPRA_CONFIRMADA = true` antes de `ofertas.js`/do retorno; para uma confirmação posterior, também emitir `window.dispatchEvent(new Event('pnf:compra-confirmada'))`. O modal é suprimido/fechado. Parâmetros da URL não são aceitos como confirmação. Esse ponto foi testado com sinal simulado; não está conectado à Cakto.

Para repetir os testes, com `playwright-core` instalado nas ferramentas: `node tools/testar-ofertas.mjs`. O script inicia e encerra seu próprio servidor e Chrome headless.
