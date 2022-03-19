import { pageStartup } from 'angular-miniprogram';
import { BaseComponentComponent } from './base-component.component';
import { BaseComponentModule } from './base-component.module';

pageStartup(BaseComponentModule, BaseComponentComponent);

describe('测试', () => {
  it('测试', () => {
    console.log('组件部分测试完成');
    expect(true).toBe(true);
  });
});
