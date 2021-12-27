import { MetaCollection } from '../mini-program-compiler';
import type { BuildPlatform } from '../platform/platform';

export interface ComponentTemplateLoaderContext {
  buildPlatform: BuildPlatform;
  otherMetaGroupPromise: Promise<Record<string, MetaCollection>>;
}
