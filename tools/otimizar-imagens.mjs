// Otimiza as imagens do projeto.
//   originais/        -> public/img (site) e pdf/img (livro)
//   fotos-originais/  -> pdf/fotos (fotos reais de etapas e pontos)
// Uso: dentro de tools/, rode `npm run imagens` (ou `node otimizar-imagens.mjs`).
// Pode rodar quantas vezes quiser: sempre regera tudo a partir das pastas de origem.
// Logos e favicons vêm prontos (SVG/PNG em logos-novos/) e não são gerados aqui.

import { readdir, writeFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEM = path.join(RAIZ, 'originais');
const ORIGEM_FOTOS = path.join(RAIZ, 'fotos-originais');
const SITE = path.join(RAIZ, 'public', 'img');
const PDF_IMG = path.join(RAIZ, 'pdf', 'img');
const PDF_FOTOS = path.join(RAIZ, 'pdf', 'fotos');
const RELATORIO = path.join(RAIZ, 'tools', 'imagens.json');

const CREME = '#FAF4E8';
const EXTENSOES = ['.png', '.jpg', '.jpeg'];

const PECAS = Array.from({ length: 12 }, (_, i) => `peca-${String(i + 1).padStart(2, '0')}`);

// Site: WebP q78 em 480 e 960.
const SITE_FOTOS = [...PECAS, 'manjedoura', 'hero-presepio', 'capa-guia', 'mockup-capa-dura'];
// Prévias do PDF e foto da testadora: geradas como as fotos do site, mas só se existirem.
const SITE_OPCIONAIS = ['previa-1', 'previa-2', 'previa-3', 'previa-4', 'previa-5', 'previa-6', 'testadora'];

// Livro: JPEG 1080 q75.
const PDF_ILUSTRACOES = [...PECAS, 'manjedoura', 'hero-presepio', 'capa-guia'];

const IGNORADAS = {
  'presepio-completo': 'cópia idêntica de hero-presepio',
  'fundo-linho': 'usada só nos criativos',
  'logo-horizontal': 'logo antigo, substituído pelos SVG',
  'logo-vertical': 'logo antigo, substituído pelos SVG',
  'logo-simbolo': 'logo antigo, substituído pelos SVG',
};

const gerados = [];

async function registrar(pasta, arquivo) {
  const caminho = path.join(pasta, arquivo);
  const meta = await sharp(caminho).metadata();
  const { size } = await stat(caminho);
  const relativo = path.relative(RAIZ, caminho).split(path.sep).join('/');
  gerados.push({ arquivo: relativo, largura: meta.width, altura: meta.height, bytes: size });
  console.log(`  ${relativo.padEnd(40)} ${`${meta.width}x${meta.height}`.padEnd(10)} ${(size / 1024).toFixed(0).padStart(5)} KB`);
}

async function mapear(pasta) {
  const mapa = new Map();
  for (const nome of await readdir(pasta)) {
    const ext = path.extname(nome).toLowerCase();
    if (!EXTENSOES.includes(ext)) continue;
    const base = path.basename(nome, path.extname(nome));
    if (mapa.has(base)) {
      throw new Error(`Há dois arquivos com o nome "${base}" em ${path.basename(pasta)}/. Deixe só um.`);
    }
    mapa.set(base, path.join(pasta, nome));
  }
  return mapa;
}

// ---------- Site ----------

async function gerarFotoSite(base, origem) {
  for (const largura of [480, 960]) {
    const arquivo = `${base}-${largura}.webp`;
    await sharp(origem)
      .rotate()
      .resize({ width: largura, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(SITE, arquivo));
    await registrar(SITE, arquivo);
  }
}

// Imagem de compartilhamento 1200x630.
async function gerarOg(origemMockup) {
  const arquivo = 'og-image.jpg';
  await sharp(origemMockup)
    .rotate()
    .resize(1200, 630, { fit: 'contain', background: CREME })
    .flatten({ background: CREME })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(path.join(SITE, arquivo));
  await registrar(SITE, arquivo);
}

// ---------- Livro (PDF) ----------

async function gerarJpeg(origem, pasta, base, largura, qualidade) {
  const arquivo = `${base}.jpg`;
  await sharp(origem)
    .rotate() // respeita a orientação das fotos de celular
    .resize({ width: largura, withoutEnlargement: true })
    .flatten({ background: '#FFFFFF' })
    .jpeg({ quality: qualidade, mozjpeg: true })
    .toFile(path.join(pasta, arquivo));
  await registrar(pasta, arquivo);
}

// ---------- Utilitários ----------

async function pesoDaPasta(pasta) {
  let total = 0;
  for (const nome of await readdir(pasta)) {
    const info = await stat(path.join(pasta, nome));
    if (info.isFile()) total += info.size;
  }
  return total;
}

function formatar(bytes) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
}

async function main() {
  for (const pasta of [SITE, PDF_IMG, PDF_FOTOS, ORIGEM_FOTOS]) await mkdir(pasta, { recursive: true });

  const originais = await mapear(ORIGEM);
  const fotosReais = await mapear(ORIGEM_FOTOS);
  const faltando = [];

  console.log('Site, fotos:');
  for (const base of SITE_FOTOS) {
    if (originais.has(base)) await gerarFotoSite(base, originais.get(base));
    else faltando.push(base);
  }
  for (const base of SITE_OPCIONAIS) {
    if (originais.has(base)) await gerarFotoSite(base, originais.get(base));
  }

  console.log('Site, compartilhamento:');
  if (originais.has('mockup-capa-dura')) await gerarOg(originais.get('mockup-capa-dura'));

  console.log('Livro, ilustrações (pdf/img):');
  for (const base of PDF_ILUSTRACOES) {
    if (originais.has(base)) await gerarJpeg(originais.get(base), PDF_IMG, base, 1080, 75);
  }

  console.log('Livro, fotos reais (pdf/fotos):');
  if (fotosReais.size === 0) console.log('  (fotos-originais/ está vazia)');
  for (const [base, origem] of fotosReais) await gerarJpeg(origem, PDF_FOTOS, base, 640, 65);

  const conhecidos = new Set([...SITE_FOTOS, ...SITE_OPCIONAIS, ...Object.keys(IGNORADAS)]);
  for (const [base, motivo] of Object.entries(IGNORADAS)) {
    if (originais.has(base)) console.log(`Ignorada: ${base} (${motivo})`);
  }
  for (const base of originais.keys()) {
    if (!conhecidos.has(base)) console.log(`Ignorada: ${base} (nome não previsto no script)`);
  }
  if (faltando.length) console.log(`\nATENÇÃO, faltam em originais/: ${faltando.join(', ')}`);

  gerados.sort((a, b) => a.arquivo.localeCompare(b.arquivo));
  await writeFile(RELATORIO, JSON.stringify(gerados, null, 2) + '\n');

  console.log(`\n${gerados.length} arquivos gerados. tools/imagens.json atualizado.`);
  console.log(`Peso total de public/img: ${formatar(await pesoDaPasta(SITE))}`);
  console.log(`Peso total de pdf/img:    ${formatar(await pesoDaPasta(PDF_IMG))}`);
  console.log(`Peso total de pdf/fotos:  ${formatar(await pesoDaPasta(PDF_FOTOS))}`);
}

main().catch((erro) => {
  console.error(erro.message || erro);
  process.exit(1);
});
