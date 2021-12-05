import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-default-structural-directive',
  templateUrl: './default-structural-directive.component.html',
  styleUrls: ['./default-structural-directive.component.css'],
})
export class DefaultStructuralDirectiveComponent implements OnInit {
  flag = {
    if: true,
    ifElse: true,
    ifDefault: true,
  };
  list = [0, 1, 2];
  ngSwitchValue: boolean | number = 0;
  ngSwitchValueList = [0, 1, 2];
  ngSwitchValueIndex = 0;
  constructor() {}

  ngOnInit() {}
  ngIfControl() {
    this.flag.if = !this.flag.if;
  }
  ngIfElseControl() {
    this.flag.ifElse = !this.flag.ifElse;
  }
  ngIfDefault() {
    this.flag.ifDefault = !this.flag.ifDefault;
  }
  addList() {
    this.list.push(this.list.length);
    this.list = this.list.slice();
  }
  removeList() {
    this.list.pop();
    this.list = this.list.slice();
  }
  changeSwitch() {
    this.ngSwitchValueIndex =
      this.ngSwitchValueList.length === this.ngSwitchValueIndex + 1
        ? 0
        : ++this.ngSwitchValueIndex;
    this.ngSwitchValue = this.ngSwitchValueList[this.ngSwitchValueIndex];
    console.log(this.ngSwitchValue);
  }
}
