import { describeBuilder } from '../../../test/plugin-describe-builder';
import {
  DEFAULT_ANGULAR_KARMA_CONFIG,
  KARMA_BUILDER_INFO,
} from '../../../test/test-builder';
import { runBuilder } from './index';
import { join, normalize } from '@angular-devkit/core';

const angularConfig = {
  ...DEFAULT_ANGULAR_KARMA_CONFIG,
};
describeBuilder(runBuilder, KARMA_BUILDER_INFO, (harness) => {
  describe('karma', () => {
    it('运行', async () => {
      const root = harness.host.root();
      let list: string[] = [];

      list.push(
        ...(await harness.host.getFileList(
          normalize(join(root, 'src', '__components'))
        )),
        ...(await harness.host.getFileList(
          normalize(join(root, 'src', 'spec'))
        ))
      );
      await harness.host.importPathRename(list);
      await harness.host.moveDir(
        ['component1', 'component2'],
        '__components',
        'components'
      );
      await harness.host.addSpecEntry(['base-component']);
      harness.useTarget('build', angularConfig);
      const result = await harness.executeOnce();
    });
  });
});
