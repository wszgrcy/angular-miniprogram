export async function loadEsmModule<T>(modulePath: string): Promise<T> {
  const namespaceObject = await new Function(
    'modulePath',
    `return import(modulePath);`
  )(modulePath);

  // If it is not ESM then the values needed will be stored in the `default` property.
  // TODO_ESM: This can be removed once `@angular/*` packages are ESM only.
  if (namespaceObject.default) {
    return namespaceObject.default;
  } else {
    return namespaceObject;
  }
}

function getAngularCompiler() {
  return loadEsmModule<typeof import('@angular/compiler')>('@angular/compiler');
}
export const angularCompilerPromise = getAngularCompiler();
export const angularCompilerCliPromise = loadEsmModule<
  typeof import('@angular/compiler-cli')
>('@angular/compiler-cli');
