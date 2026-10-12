const { withDangerousMod, withGradleProperties } = require('@expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');

module.exports = config => {
  config = withGradleProperties(config, next => {
    const key = 'expo.useLegacyPackaging';
    next.modResults = next.modResults.filter(item => item.key !== key);
    next.modResults.push({ type: 'property', key, value: 'true' });
    return next;
  });
  return withDangerousMod(config, ['android', async next => {
    const destination = path.join(next.modRequest.platformProjectRoot, 'app/src/main/assets/ai-licenses');
    fs.mkdirSync(destination, { recursive: true });
    for (const name of fs.readdirSync(path.join(next.modRequest.projectRoot, 'licenses'))) {
      fs.copyFileSync(path.join(next.modRequest.projectRoot, 'licenses', name), path.join(destination, name));
    }
    return next;
  }]);
};
