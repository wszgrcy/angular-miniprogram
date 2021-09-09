import { Injector } from '@angular/core';

export class ComponentModuleBase {
  initComponent?(injector: Injector): void;
  constructor(injector: Injector) {
    this.initComponent!(injector);
  }
}
