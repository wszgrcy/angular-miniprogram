// eslint-disable-next-line import-x/no-unassigned-import
import './util/fake-document'; // 副作用导入：装 Document 占位物，见 fake-document.ts
import { MiniProgramCore } from 'angular-miniprogram/platform/wx';

export * from './http';
export * from './application';
export * from './platform-miniprogram';
export {
  propertyChange,
  ComponentFinderService,
  AgentNode,
} from 'angular-miniprogram/platform/wx';
/** @internal */
export const bootstrapPage = MiniProgramCore.bootstrapPage;
/** @internal */
export const componentRegistry = MiniProgramCore.componentRegistry;
/** @internal */
export const bootstrapCustomTabbar = MiniProgramCore.bootstrapCustomTabbar;
export * from './token';
export { PAGE_TOKEN } from 'angular-miniprogram/platform/wx';
