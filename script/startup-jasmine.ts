import { register } from 'ts-node';
import { createTransformer } from 'static-injector/transform';
import Jasmine from 'jasmine';
import path from 'path';

register({
  project: path.resolve(__dirname, '../tsconfig.spec.json'),
  transformers: (program) => {
    const transformer = createTransformer(program);
    return {
      before: [transformer],
    };
  },
});
let jasmineInstance = new Jasmine();
let args = process.argv.slice(2) || [];
jasmineInstance.loadConfigFile(path.resolve(__dirname, '../jasmine.json'));
jasmineInstance.execute(undefined, args[0] || undefined);
