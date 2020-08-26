import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { SeleniumLauncher } from '@web/test-runner-selenium';
import webdriver, { Capabilities } from 'selenium-webdriver';
import SaucelabsAPI, {
  SauceLabsOptions,
  SauceConnectOptions,
  SauceConnectInstance,
} from 'saucelabs';
import ip from 'ip';
import { v4 as uuid } from 'uuid';

export interface SaucelabsLauncherArgs {
  capabilities: Record<string, any>;
  saucelabsOptions?: SauceLabsOptions;
  sauceConnectOptions?: SauceConnectOptions;
}

const localIp = ip.address();

export class SaucelabsLauncher extends SeleniumLauncher {
  private sauceLabsConnection?: SauceConnectInstance;

  constructor(
    private capabilities: Capabilities,
    public name: string,
    private saucelabsOptions?: SauceLabsOptions,
    private sauceConnectOptions?: SauceConnectOptions,
  ) {
    super(
      new webdriver.Builder()
        .usingServer('https://ondemand.saucelabs.com/wd/hub')
        .withCapabilities(capabilities),
    );
  }

  async start(config: TestRunnerCoreConfig) {
    const api = new SaucelabsAPI(this.saucelabsOptions ?? ({} as any));
    this.sauceLabsConnection = await api.startSauceConnect(this.sauceConnectOptions ?? {});
    await super.start(config);
  }

  startSession(sessionId: string, url: string) {
    return super.startSession(sessionId, url.replace(/(localhost|127\.0\.0\.1)/, localIp));
  }

  async startDebugSession() {
    throw new Error('Starting a debug session is not supported in browserstack');
  }

  async stop() {
    await this.sauceLabsConnection?.close();
    return super.stop();
  }
}

export function saucelabsLauncher(args: SaucelabsLauncherArgs): BrowserLauncher {
  if (!args?.capabilities) {
    throw new Error('Missing capabilities in saucelabsLauncher');
  }

  // create tunnel identifier if the user did not create one
  args.capabilities['sauce:options'] = {
    tunnelIdentifier:
      args.capabilities['sauce:options']?.tunnelIdentifier ?? `web-test-runner-${uuid()}`,
    ...args.capabilities['sauce:options'],
  };

  // sync tunnel identifier from capabilities with sauce connect
  args.sauceConnectOptions = {
    ...args.sauceConnectOptions,
    tunnelIdentifier: args.capabilities['sauce:options'].tunnelIdentifier,
  };

  args.saucelabsOptions = {
    ...args.saucelabsOptions,
    user: args.capabilities['sauce:options'].username,
    key: args.capabilities['sauce:options'].accessKey,
  };

  const caps = args.capabilities;
  const browserName =
    `${caps.browser ?? caps.browserName ?? caps.device ?? 'unknown'}${
      caps.browser_version ? ` ${caps.browser_version}` : ''
    }` + ` (${caps.os} ${caps.os_version})`;

  const capabilitiesMap = new Map(Object.entries(args.capabilities));
  const capabilities = new Capabilities(capabilitiesMap);

  return new SaucelabsLauncher(
    capabilities,
    browserName,
    args.saucelabsOptions,
    args.sauceConnectOptions,
  );
}
