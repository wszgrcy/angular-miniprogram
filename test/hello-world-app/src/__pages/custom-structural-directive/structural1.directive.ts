import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appStructural1]',
})
export class Structural1Directive {
  @Input() appStructural1: TemplateRef<any>;
  @Input() appStructural1Name: string;
  constructor(private viewContainerRef: ViewContainerRef) {}
  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.appStructural1, {
      __templateName: this.appStructural1Name,
    });
  }
}
