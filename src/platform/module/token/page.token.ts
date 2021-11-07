import { InjectionToken } from '@angular/core';
import { WxComponentInstance } from '../../type';

export const PAGE_TOKEN = new InjectionToken<WxComponentInstance>('pageToken');
