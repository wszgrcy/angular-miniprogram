/* eslint-disable @typescript-eslint/no-explicit-any */
import { MiniProgramCoreFactory as BaseFactory } from 'angular-miniprogram/platform/default';

declare const getCurrentPages: Function;
class MiniProgramCoreFactory extends BaseFactory {}
export const MiniProgramCore = new MiniProgramCoreFactory();

export {
  PAGE_TOKEN,
  MiniProgramRenderer,
  MiniProgramRendererFactory,
  ComponentFinderService,
  propertyChange,
} from 'angular-miniprogram/platform/default';
