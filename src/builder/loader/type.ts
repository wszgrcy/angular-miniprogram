import { PlatformInfo } from '../platform/platform-info';

export interface ComponentTemplateLoaderContext {
  updateLogicMapPromise: Promise<Map<string, string>>;
  platformInfo: PlatformInfo;
}
