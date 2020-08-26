/* eslint-disable @typescript-eslint/no-var-requires */
const { runTests } = require('@web/test-runner-core/test-helpers');
const { legacyPlugin } = require('@web/dev-server-legacy');
const { resolve } = require('path');

const { saucelabsLauncher } = require('../dist/saucelabsLauncher');

const sharedCapabilities = {
  name: 'integration test',
  build: `modern-web ${process.env.GITHUB_REF ?? 'local'} build ${
    process.env.GITHUB_RUN_NUMBER ?? ''
  }`,
};

it('runs tests on browserstack', async function () {
  this.timeout(50000);

  await runTests(
    {
      browsers: [
        saucelabsLauncher({
          capabilities: {
            ...sharedCapabilities,
            browserName: 'Chrome',
            browser_version: 'latest',
            os: 'windows',
            os_version: '10',
          },
        }),
        // saucelabsLauncher({
        //   capabilities: {
        //     ...sharedCapabilities,
        //     browserName: 'Safari',
        //     browser_version: '11.1',
        //     os: 'OS X',
        //     os_version: 'High Sierra',
        //   },
        // }),
        // saucelabsLauncher({
        //   capabilities: {
        //     ...sharedCapabilities,
        //     browserName: 'IE',
        //     browser_version: '11.0',
        //     os: 'Windows',
        //     os_version: '7',
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
