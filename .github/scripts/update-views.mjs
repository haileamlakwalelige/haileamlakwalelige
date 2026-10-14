import fs from 'node:fs';

const repoSlug = process.env.GITHUB_REPOSITORY || '';
const [owner, repo] = repoSlug.split('/');
const token = process.env.GITHUB_TOKEN;
const dataPath = 'views.json';

if (!owner || !repo) {
  console.error('GITHUB_REPOSITORY is not set');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const base = Number.isFinite(Number(data.base)) ? Number(data.base) : 0;
const days = data.days && typeof data.days === 'object' ? data.days : {};

const res = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/traffic/views?per_page=100`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'profile-views-counter',
    },
  },
);

if (!res.ok) {
  console.error(`traffic API failed: ${res.status} ${await res.text()}`);
  process.exit(1);
}

const body = await res.json();
for (const entry of body.views ?? []) {
  const date = String(entry.timestamp).slice(0, 10);
  const count = Number(entry.count) || 0;
  days[date] = Math.max(Number(days[date]) || 0, count);
}

const tracked = Object.values(days).reduce((sum, n) => sum + (Number(n) || 0), 0);
const total = base + tracked;

data.base = base;
data.days = days;
data.message = total.toLocaleString('en-US');

fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Profile views total: ${data.message} (base ${base} + tracked ${tracked})`);
