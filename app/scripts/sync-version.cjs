const fs = require('node:fs');
const path = require('node:path');

const appRoot = path.resolve(__dirname, '..');
const releaseVersion = fs.readFileSync(path.join(appRoot, '../VERSION'), 'utf8').trim();
const match = /^0\.(\d{3,})$/.exec(releaseVersion);
if (!match || Number(match[1]) < 1 || Number(match[1]) > 2100000000) {
  throw new Error('VERSION must be a sequential release number such as 0.001.');
}
const versionCode = Number(match[1]);
const appVersion = `0.0.${versionCode}`;
const check = process.argv.includes('--check');
let mismatched = false;

function syncJson(name, update) {
  const file = path.join(appRoot, name);
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));
  const before = JSON.stringify(content);
  update(content);
  if (JSON.stringify(content) !== before) {
    if (check) {
      console.error(`${name} does not match VERSION; run npm run version:sync.`);
      mismatched = true;
    } else {
      fs.writeFileSync(file, JSON.stringify(content, null, 2) + '\n');
    }
  }
}

syncJson('package.json', data => { data.version = appVersion; });
syncJson('package-lock.json', data => {
  data.version = appVersion;
  data.packages[''].version = appVersion;
});
syncJson('app.json', data => {
  data.expo.version = appVersion;
  data.expo.android.versionCode = versionCode;
  data.expo.extra = { ...data.expo.extra, releaseVersion };
});

const gradleFile = path.join(appRoot, 'android/app/build.gradle');
if (fs.existsSync(gradleFile)) {
  const before = fs.readFileSync(gradleFile, 'utf8');
  if (!/versionCode\s+\d+/.test(before) || !/versionName\s+"[^"]+"/.test(before)) {
    throw new Error('Android version fields were not found in build.gradle.');
  }
  const after = before.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
    .replace(/versionName\s+"[^"]+"/, `versionName "${appVersion}"`);
  if (before !== after) {
    if (check) {
      console.error('Android metadata does not match VERSION; run npm run version:sync.');
      mismatched = true;
    } else {
      fs.writeFileSync(gradleFile, after);
    }
  }
}

if (mismatched) process.exitCode = 1;
else console.log(`Release v${releaseVersion}; app ${appVersion}; Android code ${versionCode}.`);
