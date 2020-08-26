---
title: Saucelabs
eleventyNavigation:
  key: Saucelabs
  parent: Browsers
  order: 70
---

Run tests remotely on [Saucelabs](https://saucelabs.com/).

For modern browsers, we recommend using other browser launchers, as they are a lot faster. Browserstack is a good option for testing on older browser versions.

## Usage

Install the package:

```
npm i --save-dev @web/test-runner-saucelabs
```

Add the browser launcher to your `web-test-runner.confg.mjs`:

```js
import { saucelabsLauncher } from '@web/test-runner-saucelabs';

// options shared between all browsers
const sharedCapabilities = {
  'sauce:options': {
    // your username and key for saucelabs, you can get this from your saucelabs account
    // it's recommended to store these as environment variables
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,

    name: 'integration test',
    // if you are running tests in a CI, the build id might be available as an
    // environment variable. this is useful for identifying test runs
    // this is for example the name for github actions
    build: `modern-web ${process.env.GITHUB_REF ?? 'local'} build ${
      process.env.GITHUB_RUN_NUMBER ?? ''
    }`,
  },
};

export default {
  browsers: [
    // create a browser launcher per browser you want to test
    // you can get the browser capabilities from the saucelabs website
    saucelabsLauncher({
      capabilities: {
        ...sharedCapabilities,
        browserName: 'chrome',
        browserVersion: 'latest',
        platformName: 'Windows 10',
      },
    }),

    saucelabsLauncher({
      capabilities: {
        ...sharedCapabilities,
        browserName: 'safari',
        browserVersion: '11.1',
        platformName: 'macOS 10.13',
      },
    }),

    saucelabsLauncher({
      capabilities: {
        ...sharedCapabilities,
        browserName: 'internet explorer',
        browserVersion: '11.0',
        platformName: 'Windows 7',
      },
    }),
  ],
};
```

## Configuration

The Saucelabs launcher takes three properties, `capabilities`, `saucelabsOptions` and `sauceConnectOptions`. Only `capabilities` is a required option.

`capabilities` are the selenium capabilities used to configure the browser to launch in Saucelabs. You can generate most of these on the Saucelabs website. All the Saucelabs specific options go into a `sauce:options` property, and must include the `username` and `accessKey` properteis to authenticate with Saucelabs. It must also contain the `name` and `build` properties to identify the test runs.

`saucelabsOptions` are options to configure the [saucelabs library](https://www.npmjs.com/package/saucelabs) proxy for creating the library. For most use cases, you don't need to configure this property.

`sauceConnectOptions` are options to configure the [saucelabs library](https://www.npmjs.com/package/saucelabs) proxy for setting up the connection. For most use cases, you don't need to configure this property.
