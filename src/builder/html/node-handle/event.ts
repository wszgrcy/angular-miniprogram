import { ASTWithSource } from '@angular/compiler';

export class TagEventMeta {
  constructor(public name: string, public handler: ASTWithSource) {}
}
