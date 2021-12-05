export class TagEventMeta {
  public methodName!: string;
  constructor(
    public prefix: string | null | undefined,
    public name: string,
    methodNameSource: string
  ) {
    const result = methodNameSource.match(/^(.*)\(.*\)$/);
    if (result) {
      this.methodName = result[1];
    }
  }
}
