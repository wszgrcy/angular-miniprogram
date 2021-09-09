export function strictEquals(value1: any, value2: any): boolean {
  return value1 === value2 || (value1 !== value1 && value2 !== value2);
}
