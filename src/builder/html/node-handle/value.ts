export class BindValue {
  constructor(public value: string) {}
  toString() {
    return this.value;
  }
}
export class PlainValue {
  constructor(public value: string) {}
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
