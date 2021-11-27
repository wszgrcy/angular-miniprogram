/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectionToken } from 'static-injector';
import ts from 'typescript';

export const RESOLVED_META_MAP = new InjectionToken('RESOLVED_META_MAP');
export const LIBRARY_ENTRY_POINT = new InjectionToken<string>(
  'LIBRARY_ENTRY_POINT'
);
export const DIRECTIVE_MAP = new InjectionToken<Map<ts.ClassDeclaration, any>>(
  'DIRECTIVE_MAP'
);
