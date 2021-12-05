import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appStructural1]',
})
export class Structural1Directive {
  @Input() appStructural1: TemplateRef<any>;
  @Input() appStructural1Name: string;
  constructor(private viewContaienrRef: ViewContainerRef) {}
  ngOnInit(): void {
    this.viewContaienrRef.createEmbeddedView(this.appStructural1, {
      template: this.appStructural1Name,
    });
  }
}
