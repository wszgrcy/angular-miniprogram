import { MetaCollection } from '../html/meta-collection';
import type { BuildPlatform } from '../platform/platform';

export interface ComponentTemplateLoaderContext {
  metaMapPromise: Promise<Map<string, Record<string, any>>>;
  buildPlatform: BuildPlatform;
  otherMetaGroupPromise: Promise<Record<string, MetaCollection>>;
  addLibraryExtraUseComponents(
    key: string,
    useComponents: Record<string, string>
  ): void;
  addExtraTemplateNameMapping(key: string, value: string): void;
}
