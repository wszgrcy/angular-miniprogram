import type {
  R3ComponentMetadata,
  R3DirectiveMetadata,
} from '@angular/compiler';
import { InjectionToken } from 'static-injector';
import ts from 'typescript';

export const RESOLVED_DATA_GROUP_TOKEN = new InjectionToken(
  'RESOLVED_DATA_GROUP_TOKEN'
);
export const ENTRY_POINT_TOKEN = new InjectionToken<string>(
  'ENTRY_POINT_TOKEN'
);

export const ENTRY_FILE_TOKEN = new InjectionToken<string>('ENTRY_FILE_TOKEN');
