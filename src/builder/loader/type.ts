import { PlatformInfo } from '../platform/platform-info';

export interface ComponentTemplateLoaderContext {
  metaMapPromise: Promise<Map<string, string>>;
  platformInfo: PlatformInfo;
}
