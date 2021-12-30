import { MiniProgramCore } from 'angular-miniprogram/platform/wx';

export * from './http';
export * from './mini-program.module';
export * from './platform-miniprogram';
export {
  propertyChange,
  pageBind,
  ComponentFinderService,
} from 'angular-miniprogram/platform/wx';
export const pageStartup = MiniProgramCore.pageStartup;
export const componentRegistry = MiniProgramCore.componentRegistry;
export * from './token';
export { PAGE_TOKEN } from 'angular-miniprogram/platform/wx';
