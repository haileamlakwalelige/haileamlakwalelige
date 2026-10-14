import fs from 'node:fs';

const dataPath = 'views.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let count = Number(data.count);
if (!Number.isFinite(count)) {
  count = Number(String(data.message ?? '').replace(/[^0-9]/g, '')) || 0;
}

const step = Number.isFinite(Number(data.step)) ? Number(data.step) : 1;

count += step;
data.count = count;
data.message = count.toLocaleString('en-US');

fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Profile views: ${data.message} (+${step})`);
