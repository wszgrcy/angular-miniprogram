import {
  Change,
  DeleteChange,
  InsertChange,
  ReplaceChange,
} from 'cyia-code-util';

export class RawUpdater {
  static update(content: string, change: Change[]) {
    change = change.sort((a, b) => b.start - a.start);
    return new RawUpdater(content, change).update();
  }
  originContent!: string;
  constructor(private content: string, private changes: Change[]) {
    this.originContent = content;
  }
  update() {
    this.changes.forEach((change) => {
      let deleteChange: DeleteChange | undefined;
      let insertChange: InsertChange | undefined;
      if (change instanceof ReplaceChange) {
        insertChange = new InsertChange(change.start, change.content);
        deleteChange = new DeleteChange(change.start, change.length);
      } else if (change instanceof InsertChange) {
        insertChange = change;
      } else if (change instanceof DeleteChange) {
        deleteChange = change;
      }
      let list!: [string, string];
      if (deleteChange) {
        list = this.slice(deleteChange.start, deleteChange.length);
      }
      if (!list && insertChange) {
        list = this.slice(insertChange.start);
        list.splice(1, 0, insertChange.content);
      } else if (insertChange) {
        list.splice(1, 0, insertChange.content);
      }
      this.content = list.join('');
    });
    return this.content;
  }
  private slice(pos: number, length: number = 0): [string, string] {
    return [
      this.content.substring(0, pos),
      this.content.substring(pos + length),
    ];
  }
}
