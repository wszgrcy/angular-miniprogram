export class BindValue {
  constructor(public value: (str?: string) => string) {}
  toString(contextPrefix: string) {
    return this.value(contextPrefix);
  }
}
export class PlainValue {
  constructor(public value: any) {}
  toString() {
    return this.value;
  }
}
export function isBindValue(value: BindValue | PlainValue): value is BindValue {
  return value instanceof BindValue;
}
export function isPlainValue(
  value: BindValue | PlainValue
): value is PlainValue {
  return value instanceof PlainValue;
}
