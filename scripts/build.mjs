import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSites } from './sites.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'public');
const ASSETS = ['styles.css', 'favicon.svg', '.nojekyll'];

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const ARROW =
  '<span class="tool-card__arrow" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M3 8h10"/><path d="M9 4l4 4-4 4"/></svg></span>';

function escapeHtml(value) {
  return value.replace(/[&<>"]/g, (character) => ESCAPES[character]);
}

function render(template, values) {
  const output = template.replace(/\{\{(\w+)\}\}/g, (placeholder, key) => {
    if (!(key in values)) throw new Error(`template placeholder ${placeholder} has no value`);
    return values[key];
  });
  if (output.includes('{{')) throw new Error('a template placeholder uses an unsupported form');
  return output;
}

function renderCard(tool) {
  const id = `tool-${tool.slug}`;
  return [
    `      <a class="tool-card tool-card--${tool.slug}" href="./${tool.slug}/" aria-labelledby="${id}-title" aria-describedby="${id}-summary">`,
    `        <h2 class="tool-card__title" id="${id}-title">${escapeHtml(tool.name)}</h2>`,
    `        <p class="tool-card__lead" id="${id}-summary">${escapeHtml(tool.summary)}</p>`,
    `        ${ARROW}`,
    `      </a>`,
  ].join('\n');
}

function renderRecoveryLink(tool) {
  return `    <li><a href="./${tool.slug}/">${escapeHtml(tool.name)} <span class="link-arrow" aria-hidden="true">&rarr;</span></a></li>`;
}

async function writePage(file, html) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

async function main() {
  const { hub, tools } = await loadSites();
  const templates = {
    index: await readFile(join(SRC, 'index.html'), 'utf8'),
    alias: await readFile(join(SRC, 'alias.html'), 'utf8'),
    notFound: await readFile(join(SRC, '404.html'), 'utf8'),
  };

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  for (const asset of ASSETS) await cp(join(SRC, asset), join(OUT, asset));

  await writePage(
    join(OUT, 'index.html'),
    render(templates.index, {
      title: escapeHtml(hub.title),
      description: escapeHtml(hub.description),
      lede: escapeHtml(hub.lede),
      tools: tools.map(renderCard).join('\n'),
    }),
  );

  for (const tool of tools) {
    await writePage(join(OUT, tool.file), render(templates.alias, { name: escapeHtml(tool.name), url: tool.url }));
  }

  await writePage(join(OUT, '404.html'), render(templates.notFound, { links: tools.map(renderRecoveryLink).join('\n') }));

  console.log(`Built public/ with ${tools.length} tools: ${tools.map((tool) => tool.slug).join(', ')}`);
}

await main().catch((error) => {
  console.error(error.message.startsWith('sites.yml:') ? error.message : error);
  process.exitCode = 1;
});
