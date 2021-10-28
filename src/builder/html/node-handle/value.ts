export class BindValue {
  constructor(public value: (str?: string) => string) {}
  toString(contextPrefix: string) {
    return this.value(contextPrefix);
  }
}
export class PlainValue {
  constructor(public value: any) {}
  toString() {
    if (/^\s+$/.test(this.value)) {
      return `' '`;
    } else if (/^\s+|\s+$/.test(this.value)) {
      return `'${(this.value as string).replace(/^\s+|\s+$/g, ' ')}'`;
    }
    return typeof this.value === 'string' ? `'${this.value}'` : this.value;
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
