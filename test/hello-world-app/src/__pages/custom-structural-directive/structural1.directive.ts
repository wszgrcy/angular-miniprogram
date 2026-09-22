import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  input,
} from '@angular/core';

@Directive({
  standalone: false,
  selector: '[appStructural1]',
})
export class Structural1Directive {
  appStructural1 = input.required<TemplateRef<any>>();
  appStructural1Name = input.required<string>();
  constructor(private viewContainerRef: ViewContainerRef) {}
  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.appStructural1(), {
      __templateName: this.appStructural1Name(),
    });
  }
}
