import { PlatformInfo } from '../platform/platform-info';

export interface ComponentTemplateLoaderContext {
  updateLogicMap: Map<string, string>;
  platformInfo: PlatformInfo;
}
