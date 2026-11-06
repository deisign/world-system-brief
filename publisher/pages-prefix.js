import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function prefixHtml(html, base = '/world-system-brief') {
  if (!/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(base)) throw new Error('Invalid Pages base path');
  const withBase = p => p.startsWith(base + '/') || p === base ? p : base + p;
  return html
    .replace(/\bsrcset=(['"])(.*?)\1/gi,(_,quote,value)=>{
      const links=value.split(',').map(token=>{
        const match=token.match(/^(\s*)(\/[^\s,]*)(\s*[^,]*?)\s*$/);
        return match?match[1]+withBase(match[2])+match[3]:token;
      });
      return 'srcset='+quote+links.join(',')+quote;
    })
    .replace(/\b(href|src|action|poster)=(['"])\/(?!\/)([^'"]*)\2/gi,
      (_, key, quote, value) => key + '=' + quote + withBase('/' + value) + quote)
    .replace(/\burl\(\s*(['"]?)\/(?!\/)([^)'"\s]*)\1\s*\)/gi,
      (_, quote, value) => 'url(' + quote + withBase('/' + value) + quote + ')')
    .replace(/(\bcontent=(['"])\s*\d+\s*;\s*url=)\/(?!\/)([^'"]*)(\2)/gi,
      (_, start, quote, value, end) => start + withBase('/' + value) + end);
}

export function rewritePagesDirectory(root, base = '/world-system-brief') {
  let count = 0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile() && file.endsWith('.html')) {
        fs.writeFileSync(file, prefixHtml(fs.readFileSync(file, 'utf8'), base));
        count++;
      }
    }
  }
  walk(root);
  return count;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] || 'dist');
  const base = process.argv[3] || '/world-system-brief';
  if (!fs.existsSync(path.join(root, 'index.html'))) throw new Error('Missing built site: ' + root);
  const count = rewritePagesDirectory(root, base);
  if (count === 0) throw new Error('No HTML pages rewritten');
  console.log('GitHub Pages: prefixed ' + count + ' HTML pages with ' + base + '/');
}
