import ts from 'typescript';
import * as path from 'path';
import { DecoratorMetaDataResolver } from './decorator-metadata-resolver';
describe('ng-class-resolver', () => {
  it('component', () => {
    let options: ts.CompilerOptions = {};
    let program = ts.createProgram({
      rootNames: [path.resolve(__dirname, './fixture/component.ts')],
      options: options,
    });
    let list = program
      .getSourceFiles()
      .filter((item) => !item.isDeclarationFile);
    let typeChecker = program.getTypeChecker();
    let resolver = new DecoratorMetaDataResolver(program, typeChecker);
    resolver.resolverSourceFile(list[0]);
    let map = resolver.getComponentMetaMap();
    let componentMeta = [...map.values()][0];
    let templateUrl = componentMeta['templateUrl'];
    expect(templateUrl).toBeTruthy();
    expect(templateUrl).toContain('test.component.html');
    expect(componentMeta['selector']).toBeTruthy();
    expect(componentMeta['styleUrls']).toBeTruthy();
  });
  it('module', () => {
    let options: ts.CompilerOptions = {};
    let program = ts.createProgram({
      rootNames: [path.resolve(__dirname, './fixture/module.ts')],
      options: options,
    });
    let item = program
      .getSourceFiles()
      .filter((item) => !item.isDeclarationFile)
      .find((item) => item.fileName.includes('module.ts'));
    let typeChecker = program.getTypeChecker();
    let resolver = new DecoratorMetaDataResolver(program, typeChecker);
    resolver.resolverSourceFile(item);
    let map = resolver.getModuleMetaMap();
    let metaMap = [...map.values()][0];
    let declarations = metaMap['declarations'];
    expect(declarations).toBeTruthy();
    expect(declarations[0].debugName).toBe('TestComponent');
  });
});
