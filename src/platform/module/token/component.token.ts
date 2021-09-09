import { InjectionToken } from '@angular/core';
import { WxComponentInstance } from '../../type';

export const COMPONENT_TOKEN = new InjectionToken<WxComponentInstance>(
  'componentToken'
);
