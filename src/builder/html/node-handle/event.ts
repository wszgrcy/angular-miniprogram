export class TagEventMeta {
  public methodName: string;
  constructor(
    public prefix: string,
    public name: string,
    methodNameSource: string
  ) {
    this.methodName = methodNameSource.match(/^(.*)\(.*\)$/)![1];
  }
}
