import { ASTWithSource } from '@angular/compiler';

export class TagEventMeta {
  constructor(
    public prefix: string,
    public name: string,
    public handler: ASTWithSource
  ) {}
}
