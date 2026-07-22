import https from 'node:https';
import fs from 'node:fs';

const fetchSvg = (url, dest) =>
  new Promise((resolve) => {
    https
      .get(url, { headers: { 'User-Agent': 'node' } }, (r) => {
        let data = '';
        r.on('data', (c) => (data += c));
        r.on('end', () => {
          if (r.statusCode !== 200) {
            resolve({ ok: false, code: r.statusCode, dest });
            return;
          }
          fs.writeFileSync(dest, data);
          resolve({ ok: true, dest, len: data.length });
        });
      })
      .on('error', (e) => resolve({ ok: false, err: e.message, dest }));
  });

const lucide = [
  'shield', 'wallet', 'chevron-right', 'arrow-up-right', 'shield-check', 'cpu',
  'sparkles', 'scan', 'arrow-right', 'lock', 'zap', 'check-circle-2', 'activity',
  'download', 'award', 'terminal', 'refresh-cw', 'x-circle', 'alert-triangle',
  'info', 'chevron-down', 'shield-alert', 'mouse-pointer', 'sliders',
  'alert-octagon', 'x',
];

const brands = {
  openai: 'https://api.iconify.design/simple-icons/openai.svg?color=%23ffffff',
  okx: 'https://cdn.simpleicons.org/okx/white',
  supabase: 'https://cdn.simpleicons.org/supabase/white',
  postgresql: 'https://cdn.simpleicons.org/postgresql/white',
  langchain: 'https://cdn.simpleicons.org/langchain/white',
  crewai: 'https://cdn.simpleicons.org/crewai/white',
};

const fail = [];
for (const name of lucide) {
  const r = await fetchSvg(`https://api.iconify.design/lucide/${name}.svg`, `public/icons/lucide/${name}.svg`);
  if (!r.ok) fail.push(`lucide/${name} ${r.code || r.err}`);
}
for (const [name, url] of Object.entries(brands)) {
  const r = await fetchSvg(url, `public/brands/${name}.svg`);
  if (!r.ok) fail.push(`brand/${name} ${r.code || r.err}`);
}

console.log('lucide files:', fs.readdirSync('public/icons/lucide').length);
console.log('brand files:', fs.readdirSync('public/brands').join(', '));
console.log(fail.length ? `FAILURES: ${fail.join('; ')}` : 'ALL OK');
