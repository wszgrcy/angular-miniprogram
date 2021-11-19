import { angularCompilerPromise } from './load_esm';

describe('load_ems', () => {
  it('run', async () => {
    const result = await angularCompilerPromise;
    expect(result).toBeTruthy();
  });
});
