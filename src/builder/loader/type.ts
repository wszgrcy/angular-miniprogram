import { BuildPlatform } from '../platform/platform';

export interface ComponentTemplateLoaderContext {
  metaMapPromise: Promise<Map<string, string>>;
  buildPlatform: BuildPlatform;
}
