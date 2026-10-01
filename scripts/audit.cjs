const fs = require('fs');
const path = require('path');
const base = path.join(process.cwd(), 'public');
const errors = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (name.endsWith('.html')) {
      const h = fs.readFileSync(p, 'utf8');
      if (!h.includes('lang="ru"')) errors.push(`${p}: lang`);
      if ((h.match(/<h1/g) || []).length !== 1) errors.push(`${p}: h1`);
      if (/<script(?![^>]*src=)/.test(h)) errors.push(`${p}: inline script`);
      if (/\sstyle=/.test(h)) errors.push(`${p}: inline style`);
      if (/\son[a-z]+=/i.test(h)) errors.push(`${p}: inline handler`);
    }
  }
}
walk(base);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('audit ok');
