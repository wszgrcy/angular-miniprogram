/* eslint-disable @typescript-eslint/no-explicit-any */
import { MiniProgramCoreFactory as BaseFactory } from 'angular-miniprogram/platform/default';

class MiniProgramCoreFactory extends BaseFactory {}
export const MiniProgramCore = new MiniProgramCoreFactory();

export {
  PAGE_TOKEN,
  MiniProgramRenderer,
  MiniProgramRendererFactory,
  ComponentFinderService,
  propertyChange,
  pageBind,
} from 'angular-miniprogram/platform/default';
