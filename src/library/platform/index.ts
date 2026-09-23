// eslint-disable-next-line import/no-unassigned-import
import './util/fake-document'; // 副作用导入：装 Document 占位物，见 fake-document.ts
import { MiniProgramCore } from 'angular-miniprogram/platform/wx';

export * from './http';
export * from './mini-program.module';
export * from './platform-miniprogram';
export {
  propertyChange,
  ComponentFinderService,
} from 'angular-miniprogram/platform/wx';
export const pageStartup = MiniProgramCore.pageStartup;
export const bootstrapPage = MiniProgramCore.bootstrapPage;
export const componentRegistry = MiniProgramCore.componentRegistry;
export * from './token';
export { PAGE_TOKEN } from 'angular-miniprogram/platform/wx';
