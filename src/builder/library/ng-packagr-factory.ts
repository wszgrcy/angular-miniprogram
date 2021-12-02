import { COMPILE_NGC_TRANSFORM } from 'ng-packagr/lib/ng-package/entry-point/compile-ngc.di';
import { STYLESHEET_PROCESSOR } from 'ng-packagr/lib/styles/stylesheet-processor.di';
import { myCompileNgcTransformFactory } from './compile-ngc.transform';
import { hookWritePackage } from './remove-publish-only';
import { CustomStyleSheetProcessor } from './stylesheet-processor';

export async function ngPackagrFactory(
  project: string,
  tsConfig: string | undefined
) {
  const packager = (await import('ng-packagr')).ngPackagr();

  packager.forProject(project);

  if (tsConfig) {
    packager.withTsConfig(tsConfig);
  }

  COMPILE_NGC_TRANSFORM.useFactory = myCompileNgcTransformFactory;
  STYLESHEET_PROCESSOR.useFactory = () => CustomStyleSheetProcessor;
  packager.withProviders([COMPILE_NGC_TRANSFORM, hookWritePackage()]);
  return packager;
}
