import { createTransformer } from 'static-injector/transform';
import type { TsCompilerInstance } from 'ts-jest/dist/types';
import {
  SourceFile,
  TransformationContext,
  TransformerFactory,
} from 'typescript';

export const version = Math.random();
export const name = 'import-transformer';
export function factory(
  compilerInstance: TsCompilerInstance
): TransformerFactory<SourceFile> {
  const transformer = createTransformer(compilerInstance.program);
  return (ctx: TransformationContext) => {
    const fn = transformer(ctx);
    return (sf: SourceFile) => {
      return fn(sf);
    };
  };
}
