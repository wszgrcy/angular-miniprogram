import { MetaCollection } from '../html/meta-collection';
import type { BuildPlatform } from '../platform/platform';

export interface ComponentTemplateLoaderContext {
  buildPlatform: BuildPlatform;
  otherMetaGroupPromise: Promise<Record<string, MetaCollection>>;
}
