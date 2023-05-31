import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { HttpBackend, HttpFeature, HttpFeatureKind, provideHttpClient as ngProvideHttpClient } from 'angular-miniprogram/common/http';
import { MiniprogramHttpBackend } from './backend';

export function provideHttpClient(...features: HttpFeature<HttpFeatureKind>[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    ngProvideHttpClient(...features),
    MiniprogramHttpBackend,
    { provide: HttpBackend, useExisting: MiniprogramHttpBackend }
  ]);
}
