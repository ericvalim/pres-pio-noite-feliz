# Versão de produção — publicação ainda não realizada

Tecnologia: HTML, CSS e JavaScript puros, sem framework, dependências de execução ou build. A página inicial é `producao/index.html`. O CSS foi copiado integralmente da página atual para preservar o layout.

## Visualizar

Na raiz do projeto:

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory producao
```

Abra http://127.0.0.1:8000/ e encerre com Ctrl+C.

## Pasta exata para publicar

`C:\Users\Usuario\presépio-noite-feliz\producao`

Enviar somente o conteúdo dessa pasta, sem comando de build. Nunca publicar a raiz do projeto ou `public/`, que ficou como fonte original de trabalho.

A pasta de produção contém `index.html`, `termos.html`, `privacidade.html`, `_headers`, os estilos `style.css`, `helena.css` e `ofertas.css`, os scripts `main.js`, `meta-pixel.js`, `campanha-config.js` e `ofertas.js`, e as imagens referenciadas nessas páginas.

## Remoções da versão pública

- Upsell, downsell e agradecimento não foram incluídos. Nenhum link público aponta para essas páginas.
- Seção oculta “Veja por dentro” e referências a imagens ausentes foram removidas do HTML.
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

1. Dados do responsável: confirmar razão social ou identificação do vendedor, CPF/CNPJ aplicável e endereço. Por enquanto, rodapés e apresentação usam apenas a marca Ateliê Crochêtando e o suporte confirmado. Completar a identificação nos rodapés, termos e privacidade.
2. Termos: confirmar titular dos direitos e regra de venda das peças prontas. A pergunta da FAQ e a linha dos termos com a regra indefinida foram retiradas, sem conceder ou proibir a venda das peças. A proibição de copiar, revender ou compartilhar o PDF permanece. A cláusula de direitos não atribui titularidade a uma pessoa desconhecida.
3. Termos e privacidade: definir as datas da versão aprovada e revisar o conteúdo final. As linhas com datas provisórias foram retiradas, sem usar uma data fictícia.
4. Privacidade: confirmar a identificação do responsável/controlador e o tratamento de cookies adotado. A referência a Cloudflare Analytics foi retirada porque não está instalado; a descrição do Pixel passou a mencionar visitas à página de vendas, conforme o código atual.
5. Depois: escolher hospedagem, configurar domínio/DNS/HTTPS e encaminhamento de e-mail pela Cloudflare, conferir os checkouts na Cakto e o recebimento do Pixel no domínio publicado.

Nenhuma configuração de hospedagem ou DNS foi alterada. Não há pacote de publicação ou deploy externo criado.

## Validação realizada

- Conferidas as três páginas, todos os arquivos referenciados em `src`, `href`, `srcset` e `imagesrcset`, além dos fragmentos internos.
- `style.css` mantido; estilos específicos de Helena e do modal ficam em arquivos adicionais, preservando as posições usadas originalmente na prévia.
- Servidor local apontado somente para `producao/`: páginas e dependências retornaram HTTP 200. Upsell, downsell, agradecimento, arquivos da prévia, caminhos dos PDFs e README retornaram 404. O servidor foi encerrado após o teste.
- Conferidos os checkouts e a ausência de placeholders, links provisórios e arquivos com assinatura PDF na pasta de produção.
- Testes automatizados no Chrome instalado, via `tools/testar-ofertas.mjs`, com destinos de checkout simulados e chamadas externas bloqueadas. Nenhuma compra ou chamada real à Cakto foi feita. Foram cobertos os dois fluxos, aceite, continuação no Básico, recusa, X, Escape, clique fora, retorno com documento novo, repetição de pageshow e controle compartilhado da sessão.
- Tamanhos testados: 1280×900, 390×844, 320×568 e 844×390. Conferidos foco inicial/restaurado, Tab/Shift+Tab, isolamento do fundo com inert, bloqueio/restauração da rolagem, dimensões do modal, ausência de rolagem horizontal e decodificação das três fotos. Capturas locais ficam em `_fora-do-site/validacao-black-friday/`, fora da publicação.
- Conferidos campanha desligada, comprador confirmado fornecido por integração, confirmação com modal aberto, armazenamento bloqueado, ausência de abertura por tempo/saída do mouse, PageView único mesmo com inclusão repetida do Pixel e ausência de Purchase por clique.
- Continuam pendentes a confirmação dos eventos na Meta e das ofertas na conta Cakto. Os testes em navegador bloquearam fontes remotas e serviços externos; o recebimento de eventos não foi testado.

## Controle da campanha

O único interruptor é `ativa` em `public/js/campanha-config.js`. Para desligar, use `ativa: false` e execute `python tools/preparar-producao.py` para atualizar a cópia de publicação. Não é necessário alterar os cards ou a lógica do modal.

O desconto aparece no máximo uma vez por sessão da aba (`sessionStorage`), compartilhado pelos dois fluxos. A exibição já consome a oferta, inclusive X, Escape ou recusa. O clique promocional também é registrado. Sem armazenamento disponível, a campanha não abre e os links regulares continuam funcionando. Os parâmetros de campanha são repassados aos checkouts.

O primeiro clique no Completo não é interceptado: segue ao preço regular e registra somente a possibilidade de recuperação no retorno via `pageshow`. Não existe inferência de abandono ou de pagamento, alteração de histórico, interceptação do fechamento, contagem regressiva ou prazo fictício.

Não há integração administrativa ou servidor que confirme uma compra neste site estático. Uma integração confiável futura pode definir `window.PNF_COMPRA_CONFIRMADA = true` antes de `ofertas.js`/do retorno; para uma confirmação posterior, também emitir `window.dispatchEvent(new Event('pnf:compra-confirmada'))`. O modal é suprimido/fechado. Parâmetros da URL não são aceitos como confirmação. Esse ponto foi testado com sinal simulado; não está conectado à Cakto.

Para repetir os testes, com `playwright-core` instalado nas ferramentas: `node tools/testar-ofertas.mjs`. O script inicia e encerra seu próprio servidor e Chrome headless.
