export class DatasetBind {
  constructor(private data: any) {}
  toJSON() {
    return this.objectToJSON(this.data);
  }
  private objectToJSON(obj: Record<string, unknown>) {
    let str = '{';

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        str += `${key}:`;
        if (typeof element === 'string') {
          str += `${this.stringToJSON(element)}`;
        } else if (typeof element === 'number') {
          str += `${this.numberToJSON(element)}`;
        } else if (element instanceof Array) {
          str += `${this.arrayToJSON(element)}`;
        } else if (typeof element === 'object' && element !== null) {
          str += `${this.objectToJSON(element as any)}`;
        }
        str += ',';
      }
    }
    str = str.substr(0, str.length - 1);
    str += '}';
    return str;
  }
  private numberToJSON(number: number) {
    return `${number}`;
  }
  private stringToJSON(string: string) {
    return `'${string}'`;
  }
  private arrayToJSON(list: any[]) {
    let str = '[';
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      if (typeof element === 'string') {
        str += this.stringToJSON(element);
      } else if (typeof element === 'number') {
        str += this.numberToJSON(element);
      } else if (element instanceof Array) {
        str += this.arrayToJSON(element);
      } else if (typeof element === 'object' && element !== null) {
        str += this.objectToJSON(element as any);
      }
      if (i !== list.length - 1) {
        str += ',';
      }
    }
    str += ']';
    return str;
  }
}
