import { describeBuilder } from '../../../test/plugin-describe-builder';
import {
  DEFAULT_ANGULAR_LIBRARY_CONFIG,
  LIBRARY_BUILDER_INFO,
} from '../../../test/test-builder/browser';
import { execute } from './index';

describeBuilder(execute, LIBRARY_BUILDER_INFO, (harness) => {
  fdescribe('', () => {
    it('运行', async () => {
      harness.useTarget('library', DEFAULT_ANGULAR_LIBRARY_CONFIG);
      const result = await harness.executeOnce();
      expect(result).toBeTruthy();
    });
  });
});
