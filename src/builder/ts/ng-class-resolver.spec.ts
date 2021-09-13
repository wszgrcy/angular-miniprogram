import * as path from 'path';
import ts from 'typescript';
import { DecoratorMetaDataResolver } from './decorator-metadata-resolver';

describe('ng-class-resolver', () => {
  it('component', () => {
    const options: ts.CompilerOptions = {};
    const program = ts.createProgram({
      rootNames: [path.resolve(__dirname, './fixture/component.ts')],
      options: options,
    });
    const list = program
      .getSourceFiles()
      .filter((item) => !item.isDeclarationFile);
    const typeChecker = program.getTypeChecker();
    const resolver = new DecoratorMetaDataResolver(program, typeChecker);
    resolver.resolverSourceFile(list[0]);
    const map = resolver.getComponentMetaMap();
    const componentMeta = [...map.values()][0];
    const templateUrl = componentMeta['templateUrl'];
    expect(templateUrl).toBeTruthy();
    expect(templateUrl).toContain('test.component.html');
    expect(componentMeta['selector']).toBeTruthy();
    expect(componentMeta['styleUrls']).toBeTruthy();
  });
  it('module', () => {
    const options: ts.CompilerOptions = {};
    const program = ts.createProgram({
      rootNames: [path.resolve(__dirname, './fixture/module.ts')],
      options: options,
    });
    const item = program
      .getSourceFiles()
      .filter((item) => !item.isDeclarationFile)
      .find((item) => item.fileName.includes('module.ts'));
    const typeChecker = program.getTypeChecker();
    const resolver = new DecoratorMetaDataResolver(program, typeChecker);
    resolver.resolverSourceFile(item);
    const map = resolver.getModuleMetaMap();
    const metaMap = [...map.values()][0];
    const declarations = metaMap['declarations'];
    expect(declarations).toBeTruthy();
    expect(declarations[0].debugName).toBe('TestComponent');
  });
});
