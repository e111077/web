import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { SeleniumLauncher } from '@web/test-runner-selenium';
import webdriver, { Capabilities } from 'selenium-webdriver';
import SaucelabsAPI, {
  SauceLabsOptions,
  SauceConnectOptions,
  SauceConnectInstance,
} from 'saucelabs';
import ip from 'ip';

export interface SaucelabsLauncherArgs {
  capabilities: Record<string, unknown>;
  saucelabsOptions: SauceLabsOptions;
  sauceConnectOptions?: SauceConnectOptions;
}

// const REQUIRED_CAPABILITIES = [
//   'name',
//   'sauce:options.username',
//   'sauce:options.accessKey',
//   'build',
// ];
const localIp = ip.address();

export class SaucelabsLauncher extends SeleniumLauncher {
  private sauceLabsConnection?: SauceConnectInstance;

  constructor(
    private capabilities: Capabilities,
    public name: string,
    private saucelabsOptions: SauceLabsOptions,
    private sauceConnectOptions?: SauceConnectOptions,
  ) {
    super(
      new webdriver.Builder()
        .usingServer('https://ondemand.saucelabs.com/wd/hub')
        .withCapabilities(capabilities),
    );
  }

  async start(config: TestRunnerCoreConfig) {
    const api = new SaucelabsAPI(this.saucelabsOptions);
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

  if (!args?.saucelabsOptions) {
    throw new Error('Missing saucelabsOptions in saucelabsLauncher');
  }

  // TODO
  // for (const capability of REQUIRED_CAPABILITIES) {
  //   if (!args.capabilities[capability]) {
  //     throw new Error(`Missing capability: ${capability} in browserstack launcher config.`);
  //   }
  // }

  const caps = args.capabilities;
  const browserName =
    `${caps.browser ?? caps.browserName ?? caps.device ?? 'unknown'}${
      caps.browser_version ? ` ${caps.browser_version}` : ''
    }` + ` (${caps.os} ${caps.os_version})`;

  const capabilitiesMap = new Map(Object.entries(args.capabilities));
  const capabilities = new Capabilities(capabilitiesMap);
  capabilities.set('timeout', 300);

  return new SaucelabsLauncher(
    capabilities,
    browserName,
    args.saucelabsOptions,
    args.sauceConnectOptions,
  );
}
