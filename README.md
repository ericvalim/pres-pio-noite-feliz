# Ateliê Crochêtando — Presépio Noite Feliz

> **Versão de produção preparada:** a pasta de publicação agora é `producao/`, e não `public/`. Veja [PRODUCAO.md](PRODUCAO.md) para executar, publicar e conferir as pendências atuais. Nada foi publicado. As informações abaixo registram a versão de trabalho original, preservada em `public/`, que contém rascunhos e prévias e não deve ser enviada à hospedagem.

Site estático em HTML, CSS e JavaScript puro. Sem framework, backend ou build.

- Página principal: `public/index.html`.
- Estilos: `public/css/style.css`.
- Interações e repasse de parâmetros para o checkout: `public/js/main.js`.
- Pixel da página de vendas: `public/js/meta-pixel.js`.
- `tools/` contém apenas ferramentas opcionais de imagens; não é necessário instalar dependências para executar o site.

## Executar localmente

Na raiz do projeto:

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory public
```

Abra `http://127.0.0.1:8000/`. Encerre com Ctrl+C. Sirva apenas `public/`, nunca a raiz do projeto, que contém materiais do produto pago.

## Configuração atual

- Básico: R$ 14,90 — https://pay.cakto.com.br/5cvwvfi_1309610
- Completo, incluindo o pop-up de saída: R$ 27,90 — https://pay.cakto.com.br/ge3iskx_1309623
- Suporte: timing.agenciadigital@gmail.com
- Domínio previsto: https://ateliecrochetando.com.br/
- Pixel: `2573332176467688`, somente na página principal, com uma inicialização e um `PageView` por documento. Há proteção contra execução repetida do arquivo. Não adicionar outra instalação manual ou via gerenciador de tags na mesma página.
- Nenhum evento `Purchase` é emitido pelo site, nem na página de agradecimento. A mensuração de compras aprovadas deve ser conferida na integração da Cakto.
- PDFs e links privados de entrega ficam na Cakto; não copiar para `public/`.

## Pendências antes da publicação

1. Preencher os dados reais do responsável: razão social/identificação, CNPJ quando aplicável, endereço, titular dos direitos e datas nos textos existentes.
2. Definir a regra para vender peças prontas, ainda provisória na FAQ e nos termos; revisar os textos de termos e privacidade e sua correspondência às ferramentas e ao tratamento de cookies efetivamente adotados. Cloudflare Analytics está citado no modelo, mas ainda não foi instalado.
3. `upsell.html` e `downsell.html` são rascunhos com ofertas extras e links `{{...}}`. Não conectá-los ao funil nem publicá-los enquanto não forem configurados; excluí-los do pacote público se não forem utilizados. Não há links para eles na página principal.
4. A seção “Veja por dentro” está oculta e referencia imagens `previa-*` ainda ausentes. Manter oculta ou remover do pacote; só ativar com amostras públicas aprovadas, sem expor o conteúdo pago.
5. Preservada a prévia opcional `?preview=helena`; decidir antes da publicação se ela deve continuar acessível.
6. Escolher hospedagem estática e configurar a pasta pública como `public`, sem comando de build. Não enviar `pdf/`, arquivos de origem ou a raiz inteira. O arquivo `public/_headers` já contém cabeçalhos para hospedagens que suportem esse formato.
7. Depois da escolha de hospedagem, configurar domínio, DNS, HTTPS e encaminhamento de e-mail pela Cloudflare. Nada disso foi alterado nesta etapa.
8. No domínio publicado, verificar layout em celular e desktop, checkouts e preços na Cakto e recebimento de `PageView` único no Gerenciador de Eventos/Pixel Helper. Conferir também a integração de compras aprovadas na Cakto, sem efetuar compras reais apenas para testar os botões.

## Validação local realizada

Sintaxe dos três arquivos JavaScript conferida com `node --check`. Pixel executado em ambiente JavaScript isolado com e sem `fbq` preexistente e com execução repetida: uma inicialização e um PageView. Conferidos os três links de checkout da página principal e o suporte nas seis páginas. Nenhum PDF encontrado dentro de `public/`.

A validação local não confirma recebimento de eventos pela Meta, estado interno das ofertas na conta Cakto ou aparência em navegador real.
