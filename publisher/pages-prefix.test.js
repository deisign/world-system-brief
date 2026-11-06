import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { prefixHtml, rewritePagesDirectory } from './pages-prefix.js';

test('root relative links receive the project prefix', () => {
  const out = prefixHtml('<a href="/ua/atlas/read/0038/type/plex/">A</a><a href="/en/archive/">B</a><img src="/assets/logo.svg"><form action="/search/"></form>');
  assert.match(out, /href="\/world-system-brief\/ua\/atlas\/read\/0038\/type\/plex\/"/);
  assert.match(out, /href="\/world-system-brief\/en\/archive\/"/);
  assert.match(out, /src="\/world-system-brief\/assets\/logo.svg"/);
  assert.match(out, /action="\/world-system-brief\/search\/"/);
});

test('external, protocol-relative, fragment and already-prefixed URLs stay unchanged', () => {
  const input = '<a href="https://example.org/x">e</a><a href="//cdn.example.org/x">cdn</a><a href="#source">id</a><a href="/world-system-brief/en/">p</a><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans">';
  assert.equal(prefixHtml(input), input);
  const once = prefixHtml('<a href="/ua/">UA</a>');
  assert.equal(prefixHtml(once), once);
});

test('CSS root URLs and redirect URLs are prefixed', () => {
  const out = prefixHtml('<style>.a{background:url("/images/a.png")}.b{background:url(/images/b.svg)}</style><meta http-equiv="refresh" content="0;url=/en/brief/2026-11-04/">');
  assert.match(out, /url\("\/world-system-brief\/images\/a.png"\)/);
  assert.match(out, /url\(\/world-system-brief\/images\/b.svg\)/);
  assert.match(out, /content="0;url=\/world-system-brief\/en\/brief\/2026-11-04\/"/);
});

test('rewrites nested HTML without touching JS files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wsb-pages-'));
  try {
    fs.mkdirSync(path.join(dir, 'en', 'archive'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), '<a href="/en/">en</a>');
    fs.writeFileSync(path.join(dir, 'en', 'archive', 'index.html'), '<a href="/ua/">ua</a>');
    fs.writeFileSync(path.join(dir, 'asset.js'), 'const path="/ua/";');
    assert.equal(rewritePagesDirectory(dir), 2);
    assert.match(fs.readFileSync(path.join(dir, 'en', 'archive', 'index.html'), 'utf8'), /\/world-system-brief\/ua\//);
    assert.equal(fs.readFileSync(path.join(dir, 'asset.js'), 'utf8'), 'const path="/ua/";');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('rejects malformed base paths', () => {
  for (const base of ['', '/', 'https://x', '/../', '/foo bar']) assert.throws(() => prefixHtml('x', base));
});

test('responsive picture srcset paths are prefixed once and external image candidates are retained',()=>{
 const html='<picture><source media="(max-width: 650px)" srcset="/assets/engravings/cascade-mobile.svg"><source srcset="/images/a.png 1x, /images/b.png 2x"><img src="/assets/engravings/cascade.svg"></picture>';
 const out=prefixHtml(html);
 assert.match(out,/srcset="\/world-system-brief\/assets\/engravings\/cascade-mobile\.svg"/);
 assert.match(out,/srcset="\/world-system-brief\/images\/a\.png 1x, \/world-system-brief\/images\/b\.png 2x"/);
 assert.match(out,/src="\/world-system-brief\/assets\/engravings\/cascade\.svg"/);
 assert.equal(prefixHtml(out),out);
});
