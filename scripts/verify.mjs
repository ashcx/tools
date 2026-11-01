import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { chromium, webkit } from 'playwright';
import { startServer } from './serve.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const EVIDENCE = join(ROOT, 'docs/sprint-evidence/sprint-1');
const CAPTURES = join(EVIDENCE, 'captures');
const REDIRECTS_JSON = join(EVIDENCE, 'redirects.json');
const ACCESSIBILITY_JSON = join(EVIDENCE, 'accessibility.json');

const GROUPS = ['links', 'redirects', 'html', 'http', 'browser', 'axe', 'captures'];
const ARTIFACT_ORIGIN = 'http://artifact';
const HUB_ROUTE = '/tools/';
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const ALIASES = [
  {
    name: 'Image Compressor',
    marker: 'image',
    route: '/tools/image-compressor/',
    file: 'image-compressor/index.html',
    card: '.tool-card--image',
    destination: 'https://ashcx.github.io/image-compressor-v1/',
  },
  {
    name: 'Audio Toolkit',
    marker: 'audio',
    route: '/tools/audio-toolkit/',
    file: 'audio-toolkit/index.html',
    card: '.tool-card--audio',
    destination: 'https://ashcx.github.io/audio-toolkit-v1/',
  },
];

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const FAILING_IMPACTS = new Set(['serious', 'critical']);

class CheckFailure extends Error {}

function check(condition, message) {
  if (!condition) throw new CheckFailure(message);
}

function format(value) {
  return JSON.stringify(value);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new CheckFailure(`${message}\n    expected ${format(expected)}\n    actual   ${format(actual)}`);
  }
}

function assertDeepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new CheckFailure(`${message}\n    expected ${format(expected)}\n    actual   ${format(actual)}`);
  }
}

function formatDuration(milliseconds) {
  return `${(milliseconds / 1000).toFixed(1)}s`;
}

function parseArgs(argv) {
  const options = { publicDir: 'public', only: [...GROUPS] };

  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--public') {
      const value = argv[index + 1];
      if (!value) throw new Error('--public needs a directory');
      options.publicDir = value;
      index += 1;
    } else if (flag === '--only') {
      const value = argv[index + 1];
      if (!value) throw new Error(`--only needs a comma separated list of ${GROUPS.join(', ')}`);
      const requested = [...new Set(value.split(',').map((name) => name.trim()).filter(Boolean))];
      const unknown = requested.filter((name) => !GROUPS.includes(name));
      if (unknown.length) {
        throw new Error(`unknown group ${format(unknown[0])}; valid groups are ${GROUPS.join(', ')}`);
      }
      options.only = requested;
      index += 1;
    } else {
      throw new Error(`unknown argument ${format(flag)}`);
    }
  }

  return options;
}

async function listFiles(directory, extension) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await listFiles(full, extension)));
    } else if (entry.isFile() && extname(entry.name) === extension) {
      found.push(full);
    }
  }
  return found;
}

function parseAttributes(source) {
  const attributes = {};
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? '';
  }
  return attributes;
}

function parseTags(html) {
  const tags = [];
  const pattern = /<([a-zA-Z][a-zA-Z0-9:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  for (const match of html.matchAll(pattern)) {
    tags.push({ name: match[1].toLowerCase(), attributes: parseAttributes(match[2]) });
  }
  return tags;
}

function stripTags(fragment) {
  return fragment.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function anchorsOutsideNoscript(html) {
  const withoutNoscript = html.replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '');
  const anchors = [];
  for (const match of withoutNoscript.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    anchors.push({ href: parseAttributes(match[1]).href ?? null, text: stripTags(match[2]) });
  }
  return anchors;
}

function findLocalAssets(html, tags) {
  const assets = [];
  for (const tag of tags) {
    const rel = (tag.attributes.rel ?? '').toLowerCase().split(/\s+/);
    if (tag.name === 'link' && (rel.includes('stylesheet') || rel.includes('icon') || rel.includes('preload'))) {
      assets.push(`<link rel="${tag.attributes.rel}" href="${tag.attributes.href}">`);
    }
    if (tag.name === 'script' && tag.attributes.src) {
      assets.push(`<script src="${tag.attributes.src}">`);
    }
    if (['img', 'picture', 'video', 'audio', 'iframe', 'embed', 'object'].includes(tag.name)) {
      assets.push(`<${tag.name}>`);
    }
  }
  if (/@font-face/i.test(html)) assets.push('@font-face');
  for (const match of html.matchAll(/url\(\s*['"]?(?!data:)([^'")]+)/gi)) {
    assets.push(`url(${match[1].trim()})`);
  }
  return assets;
}

function parseAlias(html) {
  const tags = parseTags(html);
  const title = stripTags(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const noscript = html.match(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/i)?.[1] ?? '';
  const refresh = parseTags(noscript).find(
    (tag) => tag.name === 'meta' && (tag.attributes['http-equiv'] ?? '').toLowerCase() === 'refresh',
  );
  const refreshContent = refresh?.attributes.content ?? null;
  const anchors = anchorsOutsideNoscript(html);

  return {
    title,
    robots: tags
      .filter((tag) => tag.name === 'meta' && (tag.attributes.name ?? '').toLowerCase() === 'robots')
      .map((tag) => tag.attributes.content ?? ''),
    canonical: tags
      .filter((tag) => tag.name === 'link' && (tag.attributes.rel ?? '').toLowerCase() === 'canonical')
      .map((tag) => tag.attributes.href ?? ''),
    replace: html.match(/location\.replace\(\s*["']([^"']+)["']\s*\)/)?.[1] ?? null,
    refresh: refreshContent,
    refreshUrl: refreshContent?.match(/url\s*=\s*(\S+)/i)?.[1] ?? null,
    anchors,
    localAssets: findLocalAssets(html, tags),
  };
}

function pagePathFor(artifactRoot, file) {
  const path = relative(artifactRoot, file).split(sep).join('/');
  if (path === 'index.html') return HUB_ROUTE;
  if (path.endsWith('/index.html')) return `${HUB_ROUTE}${path.slice(0, -'index.html'.length)}`;
  return `${HUB_ROUTE}${path}`;
}

function artifactFileFor(artifactRoot, pathname) {
  if (!pathname.startsWith(HUB_ROUTE)) return null;
  let rest;
  try {
    rest = decodeURIComponent(pathname.slice(HUB_ROUTE.length));
  } catch {
    return null;
  }
  if (rest === '' || rest.endsWith('/')) rest += 'index.html';
  const target = resolve(join(artifactRoot, rest));
  if (target !== artifactRoot && !target.startsWith(artifactRoot + sep)) return null;
  return target;
}

function isAllowedAbsoluteUrl(value) {
  if (ALIASES.some((alias) => value === alias.destination || value.startsWith(alias.destination))) return true;
  return /^https:\/\/github\.com\/ashcx\/[^\s]+$/.test(value);
}

async function checkLinks(artifactRoot) {
  const files = await listFiles(artifactRoot, '.html');
  check(files.length > 0, `the artifact contains at least one .html file\n    expected at least 1\n    actual 0`);

  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const tags = parseTags(html);
    const pageLabel = relative(artifactRoot, file).split(sep).join('/');
    const baseTag = tags.find((tag) => tag.name === 'base');
    const base = new URL(baseTag?.attributes.href ?? pagePathFor(artifactRoot, file), ARTIFACT_ORIGIN);

    for (const tag of tags) {
      for (const attribute of ['href', 'src']) {
        const raw = tag.attributes[attribute];
        if (raw === undefined) continue;
        const value = raw.trim();
        if (value === '' || value.startsWith('#') || value.startsWith('data:')) continue;

        let resolved;
        try {
          resolved = new URL(value, base);
        } catch {
          throw new CheckFailure(
            `<${tag.name} ${attribute}="${value}"> in ${pageLabel} is not a resolvable URL\n    expected a URL relative to ${base.href} or an allowed absolute URL\n    actual ${format(value)}`,
          );
        }

        if (resolved.origin !== ARTIFACT_ORIGIN) {
          check(
            isAllowedAbsoluteUrl(resolved.href),
            `<${tag.name} ${attribute}="${value}"> in ${pageLabel} is an absolute URL outside the allowlist\n    expected ${format(ALIASES.map((alias) => alias.destination).concat('https://github.com/ashcx/*'))}\n    actual   ${format(resolved.href)}`,
          );
          continue;
        }

        const target = artifactFileFor(artifactRoot, resolved.pathname);
        check(
          target !== null,
          `<${tag.name} ${attribute}="${value}"> in ${pageLabel} escapes the artifact\n    expected a path under ${HUB_ROUTE}\n    actual   ${format(resolved.pathname)}`,
        );

        let info;
        try {
          info = await stat(target);
        } catch {
          throw new CheckFailure(
            `<${tag.name} ${attribute}="${value}"> in ${pageLabel} points at a missing file\n    expected ${relative(ROOT, target)}\n    actual   not found`,
          );
        }
        check(
          info.isFile(),
          `<${tag.name} ${attribute}="${value}"> in ${pageLabel} points at a directory without a trailing slash\n    expected a file\n    actual   ${relative(ROOT, target)}`,
        );
      }
    }
  }
}

async function checkRedirects(artifactRoot) {
  const report = { checkedAt: new Date().toISOString(), aliases: [] };
  const failures = [];

  for (const alias of ALIASES) {
    const html = await readFile(join(artifactRoot, alias.file), 'utf8');
    const facts = parseAlias(html);
    const assertions = {};

    const record = (name, pass, expected, actual) => {
      assertions[name] = { pass, expected, actual };
    };

    record('title', facts.title === alias.name, alias.name, facts.title);
    record(
      'robotsNoindex',
      facts.robots.length === 1 && facts.robots[0].toLowerCase() === 'noindex',
      ['noindex'],
      facts.robots,
    );
    record(
      'canonical',
      facts.canonical.length === 1 && facts.canonical[0] === alias.destination,
      [alias.destination],
      facts.canonical,
    );
    record('locationReplace', facts.replace === alias.destination, alias.destination, facts.replace);
    record('noscriptRefresh', facts.refreshUrl === alias.destination, alias.destination, facts.refresh);
    record(
      'visibleAnchor',
      facts.anchors.some((anchor) => anchor.href === alias.destination && anchor.text !== ''),
      `a visible anchor to ${alias.destination}`,
      facts.anchors,
    );
    record(
      'hubLink',
      facts.anchors.some((anchor) => anchor.href === './' || anchor.href === '../'),
      "a relative link back to the hub, './' or '../'",
      facts.anchors.map((anchor) => anchor.href),
    );
    record('noLocalAssets', facts.localAssets.length === 0, [], facts.localAssets);

    report.aliases.push({ route: alias.route, destination: alias.destination, assertions });

    const failed = Object.entries(assertions).find(([, assertion]) => !assertion.pass);
    if (failed) {
      const [name, assertion] = failed;
      failures.push(
        `${alias.route} fails ${name}\n    expected ${format(assertion.expected)}\n    actual   ${format(assertion.actual)}`,
      );
    }
  }

  await mkdir(dirname(REDIRECTS_JSON), { recursive: true });
  await writeFile(REDIRECTS_JSON, `${JSON.stringify(report, null, 2)}\n`);

  if (failures.length) {
    throw new CheckFailure(`${failures.length} alias assertion(s) failed\n  ${failures.join('\n  ')}`);
  }
}

async function resolveHtmlValidate(artifactRoot) {
  const packagePath = join(ROOT, 'node_modules/html-validate/package.json');
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
  const bins = typeof packageJson.bin === 'string' ? { 'html-validate': packageJson.bin } : packageJson.bin;
  const entry =
    Object.entries(bins).find(([name]) => name === 'html-validate') ?? Object.entries(bins)[0];
  if (!entry) throw new CheckFailure('html-validate exposes no bin entry');
  const binPath = join(dirname(packagePath), entry[1]);

  return new Promise((finished) => {
    const child = spawn(process.execPath, [binPath, artifactRoot], { cwd: ROOT });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
    });
    child.on('close', (code) => finished({ code, output }));
  });
}

async function checkHtml(artifactRoot) {
  const { code, output } = await resolveHtmlValidate(artifactRoot);
  if (code !== 0) {
    throw new CheckFailure(`html-validate exited ${code}\n${output.trim()}`);
  }
}

async function fetchText(url) {
  const response = await fetch(url);
  const body = await response.text();
  return { response, body };
}

async function checkHttp(server) {
  const pages = [
    { path: '/tools/', type: 'text/html; charset=utf-8' },
    { path: '/tools/styles.css', type: 'text/css; charset=utf-8' },
    { path: '/tools/favicon.svg', type: 'image/svg+xml' },
    { path: '/tools/image-compressor/', type: 'text/html; charset=utf-8' },
    { path: '/tools/audio-toolkit/', type: 'text/html; charset=utf-8' },
  ];

  for (const page of pages) {
    const { response } = await fetchText(server.url + page.path);
    assertEqual(response.status, 200, `status for ${page.path}`);
    assertEqual(response.headers.get('content-type'), page.type, `content-type for ${page.path}`);
  }

  for (const path of ['/tools', '/tools/image-compressor']) {
    const response = await fetch(server.url + path, { redirect: 'manual' });
    assertEqual(response.status, 301, `status for ${path} without a trailing slash`);
    assertEqual(
      new URL(response.headers.get('location'), server.url).pathname,
      `${path}/`,
      `redirect target for ${path} without a trailing slash`,
    );
  }

  const recoveryLinks = ['./', './image-compressor/', './audio-toolkit/'];
  for (const path of ['/tools/nope/', '/tools/deep/missing', '/elsewhere/']) {
    const { response, body } = await fetchText(server.url + path);
    assertEqual(response.status, 404, `status for a missing path ${path}`);
    assertEqual(response.headers.get('content-type'), 'text/html; charset=utf-8', `404 content-type for ${path}`);
    check(body.includes('Page not found'), `the 404 body for ${path} names the failure\n    expected the text "Page not found"\n    actual   ${format(body.slice(0, 120))}`);
    for (const href of recoveryLinks) {
      check(
        body.includes(`href="${href}"`),
        `the 404 body for ${path} offers a recovery link\n    expected href="${href}"\n    actual   absent`,
      );
    }
  }
}

async function withContext(browser, options, run) {
  const context = await browser.newContext(options);
  try {
    return await run(context);
  } finally {
    await context.close();
  }
}

function stubPage(marker) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Stub ${marker}</title>
</head>
<body><main data-stub="${marker}">Stub ${marker} app</main></body>
</html>`;
}

function stubResponse(marker) {
  return { status: 200, contentType: 'text/html; charset=utf-8', body: stubPage(marker) };
}

function themeOf(page) {
  return page.evaluate(() => document.documentElement.dataset.theme ?? null);
}

function storedTheme(page) {
  return page.evaluate(() => localStorage.getItem('media-toolkit-theme'));
}

async function waitForTheme(page, expected, message) {
  await page
    .waitForFunction((value) => document.documentElement.dataset.theme === value, expected, { timeout: 5000 })
    .catch(() => {});
  assertEqual(await themeOf(page), expected, message);
}

async function clickThemeLabel(page, name) {
  await page.locator(`label[for="theme-${name}"]`).click();
}

async function checkLayout(browser, server) {
  await withContext(browser, { viewport: DESKTOP, colorScheme: 'light' }, async (context) => {
    const page = await context.newPage();
    await page.goto(server.url + HUB_ROUTE);

    assertEqual(await page.locator('h1').count(), 1, 'the hub has exactly one h1');
    assertEqual(await page.locator('h2').count(), 2, 'the hub has exactly two h2');
    assertEqual(await page.locator('.tool-card').count(), 2, 'the hub has exactly two cards');
    assertEqual(await page.locator('.tool-card h2').count(), 2, 'both h2 sit inside the cards');
    assertDeepEqual(
      await page.locator('.tool-card h2').allTextContents(),
      ['Image Compressor', 'Audio Toolkit'],
      'the card headings are Image Compressor and Audio Toolkit',
    );

    const cardHrefs = await page.locator('.tool-card').evaluateAll((cards) => cards.map((card) => card.href));
    assertDeepEqual(
      cardHrefs.map((href) => new URL(href).pathname),
      ALIASES.map((alias) => alias.route),
      'the card hrefs resolve to the alias routes',
    );

    for (const alias of ALIASES) {
      const facts = parseAlias((await fetchText(server.url + alias.route)).body);
      assertDeepEqual(facts.canonical, [alias.destination], `the served alias ${alias.route} targets the live app`);
    }

    const imageCard = await page.locator('.tool-card--image').boundingBox();
    const audioCard = await page.locator('.tool-card--audio').boundingBox();
    check(imageCard !== null && audioCard !== null, 'both cards have a layout box at 1440');
    check(
      Math.abs(imageCard.y - audioCard.y) <= 1,
      `the cards share a row at 1440\n    expected |top difference| <= 1px\n    actual   ${format(Math.abs(imageCard.y - audioCard.y))}px`,
    );
    check(
      audioCard.x > imageCard.x,
      `the audio card sits to the right at 1440\n    expected left > ${format(imageCard.x)}\n    actual   ${format(audioCard.x)}`,
    );

    await page.setViewportSize(MOBILE);
    const stackedImage = await page.locator('.tool-card--image').boundingBox();
    const stackedAudio = await page.locator('.tool-card--audio').boundingBox();
    check(
      stackedAudio.y > stackedImage.y + 1,
      `the cards stack at 390\n    expected audio top > image top + 1\n    actual   image ${format(stackedImage.y)}, audio ${format(stackedAudio.y)}`,
    );

    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 760 ? MOBILE.height : DESKTOP.height });
      const metrics = await page.evaluate(() => ({
        scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        clientWidth: document.documentElement.clientWidth,
      }));
      check(
        metrics.scrollWidth <= metrics.clientWidth + 1,
        `no horizontal overflow at ${width}\n    expected scrollWidth <= ${metrics.clientWidth + 1}\n    actual   scrollWidth ${metrics.scrollWidth}`,
      );
    }
  });
}

async function checkTheme(browser, server) {
  for (const scheme of ['light', 'dark']) {
    await withContext(browser, { viewport: DESKTOP, colorScheme: scheme }, async (context) => {
      const page = await context.newPage();
      await page.goto(server.url + HUB_ROUTE);
      assertEqual(await storedTheme(page), null, `nothing is stored on a first visit under a ${scheme} scheme`);
      assertEqual(await themeOf(page), scheme, `data-theme follows prefers-color-scheme ${scheme}`);
      assertEqual(
        await page.locator('#theme-system').isChecked(),
        true,
        `the system radio is checked on a first visit under a ${scheme} scheme`,
      );
      assertDeepEqual(
        await page.locator('input[name="theme"]').evaluateAll((inputs) => inputs.map((input) => input.id)),
        ['theme-system', 'theme-light', 'theme-dark'],
        'the theme radios are system, light, dark in that order',
      );
    });
  }

  await withContext(browser, { viewport: DESKTOP, colorScheme: 'light' }, async (context) => {
    const page = await context.newPage();
    await page.goto(server.url + HUB_ROUTE);

    await clickThemeLabel(page, 'dark');
    assertEqual(await themeOf(page), 'dark', 'choosing dark applies data-theme="dark"');
    assertEqual(await page.locator('#theme-dark').isChecked(), true, 'choosing dark checks the dark radio');
    assertEqual(await storedTheme(page), 'dark', 'choosing dark stores "dark"');

    await page.reload();
    assertEqual(await themeOf(page), 'dark', 'data-theme stays dark after a reload');
    assertEqual(await page.locator('#theme-dark').isChecked(), true, 'the dark radio stays checked after a reload');

    await page.emulateMedia({ colorScheme: 'dark' });
    await waitForTheme(page, 'dark', 'an explicit dark choice ignores the scheme');

    await clickThemeLabel(page, 'system');
    assertEqual(await storedTheme(page), 'system', 'choosing system stores "system"');
    await waitForTheme(page, 'dark', 'system follows the emulated dark scheme');
    assertEqual(await page.locator('#theme-system').isChecked(), true, 'choosing system checks the system radio');

    await page.emulateMedia({ colorScheme: 'light' });
    await waitForTheme(page, 'light', 'system follows a live change to the light scheme');
  });
}

async function resolveFocusChord(browser, server) {
  return withContext(browser, { viewport: DESKTOP }, async (context) => {
    const page = await context.newPage();
    for (const chord of ['Tab', 'Alt+Tab']) {
      await page.goto(server.url + HUB_ROUTE);
      await page.keyboard.press(chord);
      const className = await page.evaluate(() => {
        const element = document.activeElement;
        return typeof element?.className === 'string' ? element.className : '';
      });
      if (className.includes('skip-link')) {
        return chord;
      }
    }
    throw new Error('no keyboard chord reaches the skip link\n    expected Tab or Alt+Tab to focus .skip-link\n    actual   neither chord moved focus to it');
  });
}

async function checkKeyboard(browser, server) {
  // WebKit on macOS skips links on plain Tab; Option+Tab is the platform chord for link focus.
  const tabKey = await resolveFocusChord(browser, server);

  await withContext(browser, { viewport: DESKTOP }, async (context) => {
    const page = await context.newPage();
    await page.goto(server.url + HUB_ROUTE);
    await page.keyboard.press(tabKey);
    assertEqual(
      await page.evaluate(() => document.activeElement?.className ?? null),
      'skip-link',
      `the first ${tabKey} stop is the skip link`,
    );

    await page.keyboard.press('Enter');
    assertEqual(
      await page.evaluate(() => document.activeElement?.id ?? null),
      'main',
      'Enter on the skip link moves focus into main',
    );

    await page.goto(server.url + HUB_ROUTE);
    const stops = [];
    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press(tabKey);
      stops.push(
        await page.evaluate(() => {
          const element = document.activeElement;
          const style = getComputedStyle(element);
          return {
            tag: element.tagName.toLowerCase(),
            id: element.id,
            className: typeof element.className === 'string' ? element.className : '',
            text: (element.textContent ?? '').replace(/\s+/g, ' ').trim(),
            outlineStyle: style.outlineStyle,
            outlineWidth: Number.parseFloat(style.outlineWidth) || 0,
          };
        }),
      );
    }

    check(stops[0].className.includes('skip-link'), `the first ${tabKey} stop is the skip link\n    expected a .skip-link\n    actual   ${format(stops[0])}`);
    check(stops[1].className.includes('brand'), `the brand is reachable with ${tabKey}\n    expected a .brand anchor\n    actual   ${format(stops[1])}`);
    check(
      stops[2].tag === 'input' && stops[2].id.startsWith('theme-'),
      `the theme group is reachable with ${tabKey}\n    expected one of the theme radios\n    actual   ${format(stops[2])}`,
    );
    check(
      stops[3].className.includes('tool-card--image'),
      `the image card is reachable with ${tabKey}\n    expected .tool-card--image\n    actual   ${format(stops[3])}`,
    );
    check(
      stops[4].className.includes('tool-card--audio'),
      `the audio card is reachable with ${tabKey}\n    expected .tool-card--audio\n    actual   ${format(stops[4])}`,
    );
    assertDeepEqual(
      stops.slice(5, 8).map((stop) => stop.text),
      ['Hub repository', 'Image Compressor repository', 'Audio Toolkit repository'],
      `the footer links are reachable with ${tabKey}`,
    );

    for (const stop of [stops[3], stops[4]]) {
      check(
        stop.outlineStyle === 'solid' && stop.outlineWidth >= 1,
        `the focused card draws an outline\n    expected outline-style solid and outline-width >= 1px\n    actual   ${stop.outlineStyle}, ${stop.outlineWidth}px`,
      );
    }
  });
}

async function interceptApps(context) {
  for (const alias of ALIASES) {
    await context.route(`${alias.destination}**`, (route) => route.fulfill(stubResponse(alias.marker)));
  }
}

async function checkAliasNavigation(browser, server) {
  await withContext(browser, { viewport: DESKTOP }, async (context) => {
    await interceptApps(context);

    for (const alias of ALIASES) {
      const page = await context.newPage();
      await page.goto(server.url + alias.route);
      await page.waitForURL(alias.destination);
      assertEqual(page.url(), alias.destination, `${alias.route} replaces location with the live app`);
      assertEqual(
        await page.locator(`[data-stub="${alias.marker}"]`).count(),
        1,
        `${alias.route} loads the ${alias.marker} app document`,
      );
      await page.close();
    }

    for (const alias of ALIASES) {
      const page = await context.newPage();
      await page.goto(server.url + HUB_ROUTE);
      await page.locator(alias.card).click();
      await page.waitForURL(alias.destination);
      assertEqual(page.url(), alias.destination, `clicking the ${alias.name} card reaches the live app`);
      assertEqual(
        await page.locator(`[data-stub="${alias.marker}"]`).count(),
        1,
        `clicking the ${alias.name} card loads the ${alias.marker} app document`,
      );
      await page.close();
    }
  });
}

async function checkAliasWithoutJavaScript(browser, server, engineName, skips) {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: DESKTOP });
  try {
    await interceptApps(context);
    const page = await context.newPage();

    for (const alias of ALIASES) {
      await page.goto(server.url + alias.route);
      try {
        await page.waitForURL(alias.destination, { timeout: 10000 });
      } catch {
        skips.push(
          `${engineName} could not complete ${alias.route} with JavaScript disabled within 10s, so the noscript refresh is unproven on this engine`,
        );
        continue;
      }
      assertEqual(page.url(), alias.destination, `${alias.route} reaches the live app with JavaScript disabled`);
      assertEqual(
        await page.locator(`[data-stub="${alias.marker}"]`).count(),
        1,
        `${alias.route} loads the ${alias.marker} app document with JavaScript disabled`,
      );
    }
  } finally {
    await context.close();
  }
}

async function checkNotFound(browser, server) {
  await withContext(browser, { viewport: DESKTOP }, async (context) => {
    const page = await context.newPage();
    const response = await page.goto(`${server.url}/tools/deep/missing`);
    check(response !== null, 'a missing path reaches the browser as a document response');
    assertEqual(response.status(), 404, 'the browser sees status 404 for a missing path');
    assertDeepEqual(
      await page.locator('.links a').evaluateAll((anchors) => anchors.map((anchor) => anchor.href)),
      [`${server.url}${HUB_ROUTE}`, `${server.url}${ALIASES[0].route}`, `${server.url}${ALIASES[1].route}`],
      'the 404 page offers three recovery links that resolve to hub routes',
    );
  });
}

async function checkLocalOnlyLoad(browser, server) {
  await withContext(browser, { viewport: DESKTOP }, async (context) => {
    const page = await context.newPage();
    const requests = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto(server.url + HUB_ROUTE);
    await page.waitForLoadState('networkidle');

    const origin = new URL(server.url).origin;
    const foreign = requests.filter((url) => new URL(url).origin !== origin);
    assertDeepEqual(foreign, [], 'every request made by the hub load stays on the local origin');
  });
}

async function checkReducedMotion(browser, server) {
  await withContext(browser, { viewport: DESKTOP, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    await page.goto(server.url + HUB_ROUTE);
    const duration = await page
      .locator('.tool-card')
      .first()
      .evaluate((card) => getComputedStyle(card).transitionDuration);
    assertEqual(duration, '0s', 'reduced motion removes the card transition');
  });
}

async function checkBlockedStorage(browser, server) {
  await withContext(browser, { viewport: DESKTOP }, async (context) => {
    await context.addInitScript(() => {
      Object.defineProperty(Storage.prototype, 'setItem', {
        configurable: true,
        value() {
          throw new DOMException('storage blocked', 'SecurityError');
        },
      });
    });

    const page = await context.newPage();
    await page.goto(server.url + HUB_ROUTE);
    await clickThemeLabel(page, 'dark');
    assertEqual(await themeOf(page), 'dark', 'a theme choice still applies when storage throws');

    await page.reload();
    assertEqual(await page.locator('h1').count(), 1, 'the hub still renders when storage throws');
    assertEqual(await page.locator('.tool-card').count(), 2, 'both cards still render when storage throws');
    const theme = await themeOf(page);
    check(
      theme === 'light' || theme === 'dark',
      `data-theme is still set when storage throws\n    expected "light" or "dark"\n    actual   ${format(theme)}`,
    );
  });
}

async function checkBrowser(server) {
  const skips = [];
  const engines = [
    ['chromium', chromium],
    ['webkit', webkit],
  ];

  for (const [engineName, engine] of engines) {
    const browser = await engine.launch();
    try {
      const scoped = async (name, run) => {
        try {
          await run();
        } catch (error) {
          if (error instanceof CheckFailure) {
            throw new CheckFailure(`[${engineName}] ${name}: ${error.message}`);
          }
          throw error;
        }
      };

      await scoped('layout', () => checkLayout(browser, server));
      await scoped('theme', () => checkTheme(browser, server));
      await scoped('keyboard', () => checkKeyboard(browser, server));
      await scoped('alias navigation', () => checkAliasNavigation(browser, server));
      await scoped('alias without JavaScript', () =>
        checkAliasWithoutJavaScript(browser, server, engineName, skips),
      );
      await scoped('404', () => checkNotFound(browser, server));
      await scoped('local-only load', () => checkLocalOnlyLoad(browser, server));
      await scoped('reduced motion', () => checkReducedMotion(browser, server));
      await scoped('blocked storage', () => checkBlockedStorage(browser, server));
    } finally {
      await browser.close();
    }
  }

  for (const skip of skips) {
    console.log(`SKIP browser: ${skip}`);
  }
}

async function checkAxe(server) {
  const runs = [];
  const failures = [];
  const engines = [
    ['chromium', chromium],
    ['webkit', webkit],
  ];

  for (const [engineName, engine] of engines) {
    const browser = await engine.launch();
    try {
      for (const theme of ['light', 'dark']) {
        await withContext(browser, { viewport: DESKTOP, colorScheme: theme }, async (context) => {
          const page = await context.newPage();
          await page.goto(server.url + HUB_ROUTE);
          assertEqual(await themeOf(page), theme, `the axe run happens in the ${theme} theme`);

          const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
          const counts = { violations: results.violations.length, serious: 0, critical: 0, moderate: 0, minor: 0 };
          const violations = [];

          for (const violation of results.violations) {
            if (violation.impact === 'serious') counts.serious += 1;
            if (violation.impact === 'critical') counts.critical += 1;
            if (violation.impact === 'moderate') counts.moderate += 1;
            if (violation.impact === 'minor') counts.minor += 1;

            violations.push({
              id: violation.id,
              impact: violation.impact,
              help: violation.help,
              targets: violation.nodes.map((node) => node.target),
            });

            if (FAILING_IMPACTS.has(violation.impact)) {
              failures.push(
                `[${engineName}/${theme}] ${violation.id} (${violation.impact}): ${violation.help}\n    expected no ${violation.impact} violation\n    actual   ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
              );
            }
          }

          runs.push({ engine: engineName, theme, counts, violations });
        });
      }
    } finally {
      await browser.close();
    }
  }

  await mkdir(dirname(ACCESSIBILITY_JSON), { recursive: true });
  await writeFile(
    ACCESSIBILITY_JSON,
    `${JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        tags: AXE_TAGS,
        failOn: [...FAILING_IMPACTS],
        runs,
      },
      null,
      2,
    )}\n`,
  );

  if (failures.length) {
    throw new CheckFailure(`${failures.length} serious or critical axe violation(s)\n  ${failures.join('\n  ')}`);
  }
}

async function checkCaptures(server) {
  await mkdir(CAPTURES, { recursive: true });
  const browser = await chromium.launch();

  try {
    const shots = [
      { file: 'desktop-light.png', viewport: DESKTOP, colorScheme: 'light', path: HUB_ROUTE },
      { file: 'desktop-dark.png', viewport: DESKTOP, colorScheme: 'dark', path: HUB_ROUTE },
      { file: 'mobile-light.png', viewport: MOBILE, colorScheme: 'light', path: HUB_ROUTE },
      { file: 'mobile-dark.png', viewport: MOBILE, colorScheme: 'dark', path: HUB_ROUTE },
      { file: 'mobile-320.png', viewport: { width: 320, height: MOBILE.height }, colorScheme: 'light', path: HUB_ROUTE },
      { file: '404.png', viewport: DESKTOP, colorScheme: 'light', path: '/tools/nope/' },
    ];

    for (const shot of shots) {
      await withContext(
        browser,
        { viewport: shot.viewport, colorScheme: shot.colorScheme },
        async (context) => {
          const page = await context.newPage();
          await page.goto(server.url + shot.path);
          await page.locator('h1').waitFor();
          await page.screenshot({ path: join(CAPTURES, shot.file), fullPage: true });
        },
      );
      check(
        (await stat(join(CAPTURES, shot.file))).size > 0,
        `the ${shot.file} capture is written\n    expected a non-empty file\n    actual   empty`,
      );
    }

    await withContext(
      browser,
      { viewport: DESKTOP, colorScheme: 'light', javaScriptEnabled: false },
      async (context) => {
        // A 204 answer to the meta refresh keeps the fallback document visible instead of replacing it.
        await context.route(`${ALIASES[0].destination}**`, (route) => route.fulfill({ status: 204, body: '' }));
        const page = await context.newPage();
        await page.goto(server.url + ALIASES[0].route);
        await page.locator('main h1').waitFor();
        assertEqual(
          await page.locator('main h1').textContent(),
          ALIASES[0].name,
          'the no-JavaScript capture shows the alias fallback page',
        );
        await page.screenshot({ path: join(CAPTURES, 'redirect-no-js.png'), fullPage: true });
      },
    );
    check(
      (await stat(join(CAPTURES, 'redirect-no-js.png'))).size > 0,
      'the redirect-no-js.png capture is written\n    expected a non-empty file\n    actual   empty',
    );
  } finally {
    await browser.close();
  }
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
    return;
  }

  const artifactRoot = resolve(process.cwd(), options.publicDir);
  try {
    const info = await stat(artifactRoot);
    if (!info.isDirectory()) throw new Error(`${artifactRoot} is not a directory`);
  } catch (error) {
    console.error(`artifact directory unavailable: ${artifactRoot} (${error.message})`);
    process.exitCode = 2;
    return;
  }

  const started = performance.now();
  let server;
  const failed = [];

  try {
    server = await startServer({ root: artifactRoot });

    for (const group of options.only) {
      const groupStarted = performance.now();
      try {
        if (group === 'links') await checkLinks(artifactRoot);
        if (group === 'redirects') await checkRedirects(artifactRoot);
        if (group === 'html') await checkHtml(artifactRoot);
        if (group === 'http') await checkHttp(server);
        if (group === 'browser') await checkBrowser(server);
        if (group === 'axe') await checkAxe(server);
        if (group === 'captures') await checkCaptures(server);
        console.log(`PASS ${group} (${formatDuration(performance.now() - groupStarted)})`);
      } catch (error) {
        failed.push(group);
        console.log(`FAIL ${group} (${formatDuration(performance.now() - groupStarted)})`);
        console.error(`  ${error.message}`);
        if (!(error instanceof CheckFailure) && error.stack) console.error(error.stack);
      }
    }
  } finally {
    if (server) await server.close();
  }

  const duration = formatDuration(performance.now() - started);
  if (failed.length) {
    console.log(`FAIL ${failed.length} of ${options.only.length} groups in ${duration}: ${failed.join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS all ${options.only.length} groups in ${duration}`);
  }
}

await main();
