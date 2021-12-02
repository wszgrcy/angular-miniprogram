import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appCustomStruct]',
})
export class CustomStructDirective {
  @Input() appCustomStruct: TemplateRef<any>;
  @Input() appCustomStructName: string;
  constructor(private viewContainerRef: ViewContainerRef) {}
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log('初始化', this.appCustomStruct);
    this.viewContainerRef.createEmbeddedView(this.appCustomStruct, {
      template: this.appCustomStructName,
      $implicit: 'sdfsdfds',
    });
  }
}
