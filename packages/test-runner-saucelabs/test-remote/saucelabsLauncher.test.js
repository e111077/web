/* eslint-disable @typescript-eslint/no-var-requires */
const { runTests } = require('@web/test-runner-core/test-helpers');
const { legacyPlugin } = require('@web/dev-server-legacy');
const { resolve } = require('path');

const { saucelabsLauncher } = require('../dist/saucelabsLauncher');

const sharedCapabilities = {
  'sauce:options': {
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    build: `modern-web ${process.env.GITHUB_REF ?? 'local'} build ${process.env.GITHUB_RUN_NUMBER ??
      ''}`,
    name: 'integration test',
  },
};

it('runs tests on saucelabs', async function() {
  this.timeout(50000);

  await runTests(
    {
      browsers: [
        saucelabsLauncher({
          capabilities: {
            ...sharedCapabilities,
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 10',
          },
        }),
        // saucelabsLauncher({
        //   capabilities: {
        //     ...sharedCapabilities,
        //     browserName: 'safari',
        //     browserVersion: '11.1',
        //     platformName: 'macOS 10.13',
        //   },
        // }),
        // saucelabsLauncher({
        //   capabilities: {
        //     ...sharedCapabilities,
        //     browserName: 'internet explorer',
        //     browserVersion: '11.0',
        //     platformName: 'Windows 7',
        //   },
        // }),
      ],
      plugins: [legacyPlugin()],
      concurrency: 3,
    },
    [
      resolve(__dirname, 'fixtures', 'a.js'),
      resolve(__dirname, 'fixtures', 'b.js'),
      resolve(__dirname, 'fixtures', 'c.js'),
    ],
  );
});
