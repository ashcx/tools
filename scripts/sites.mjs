import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';

const CONFIG_FILE = fileURLToPath(new URL('../sites.yml', import.meta.url));
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message) {
  throw new Error(`sites.yml: ${message}`);
}

function requiredText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') fail(`${field} must be a non-empty string`);
  return value.trim();
}

export async function loadSites() {
  let document;
  try {
    document = load(await readFile(CONFIG_FILE, 'utf8'));
  } catch (error) {
    fail(error.message);
  }
  if (!document || typeof document !== 'object') fail('the file must be a YAML mapping');

  const title = requiredText(document.hub?.title, 'hub.title');
  const lede = requiredText(document.hub?.lede, 'hub.lede');
  const description =
    document.hub?.description === undefined ? lede : requiredText(document.hub.description, 'hub.description');
  const hub = { title, description, lede };

  if (!Array.isArray(document.tools) || document.tools.length === 0) {
    fail('tools must be a non-empty list');
  }

  const seen = new Set();
  const tools = document.tools.map((entry, index) => {
    const at = `tools[${index}]`;
    if (!entry || typeof entry !== 'object') fail(`${at} must be a mapping`);

    const name = requiredText(entry.name, `${at}.name`);
    const slug = requiredText(entry.slug, `${at}.slug`);
    const summary = requiredText(entry.summary, `${at}.summary`);
    const url = requiredText(entry.url, `${at}.url`);

    if (!SLUG.test(slug)) fail(`${at}.slug must be lowercase letters, digits, and single hyphens`);
    if (seen.has(slug)) fail(`${at}.slug repeats ${slug}`);
    seen.add(slug);

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      fail(`${at}.url must be an absolute URL`);
    }
    if (parsed.protocol !== 'https:') fail(`${at}.url must use https`);

    return {
      name,
      slug,
      summary,
      url,
      route: `/tools/${slug}/`,
      file: `${slug}/index.html`,
      card: `.tool-card--${slug}`,
    };
  });

  return { hub, tools };
}
