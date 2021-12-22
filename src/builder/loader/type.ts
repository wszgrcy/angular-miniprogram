import { MetaCollection } from '../html/meta-collection';
import type { BuildPlatform } from '../platform/platform';

export interface ComponentTemplateLoaderContext {
  metaMapPromise: Promise<Map<string, Record<string, any>>>;
  buildPlatform: BuildPlatform;
  otherMetaGroupPromise: Promise<Record<string, MetaCollection>>;
}
