import * as fs from 'fs';
import * as path from 'path';
function merge(origin: string, additional: string, output: string) {
  origin = require.resolve(origin);
  additional = require.resolve(additional);
  let originFile = JSON.parse(fs.readFileSync(origin).toString());
  let additionalFile = JSON.parse(fs.readFileSync(additional).toString());
  let outputAbsolutePath = path.resolve(path.dirname(additional), output);
  originFile['properties'] = {
    ...additionalFile['properties'],
    ...originFile['properties'],
  };
  originFile['definitions'] = {
    ...originFile['definitions'],
    ...additionalFile['definitions'],
  };
  fs.writeFileSync(
    outputAbsolutePath,
    JSON.stringify(originFile, undefined, 2)
  );
}
function main() {
  merge(
    '@angular-devkit/build-angular/src/browser/schema.json',
    '../src/builder/application/schema.base.json',
    './schema.json'
  );
}
main();
