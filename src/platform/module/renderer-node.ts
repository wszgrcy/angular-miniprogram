export class NoopNode {
  selector!: any;
  name!: string;
  parent!: NoopNode;
  nextSibling!: NoopNode;
  attribute: Record<string, string> = {};
  style: Record<string, string> = {};
  property: Record<string, string> = {};
  classList = new Set<string>();
  value!: string;
  children: NoopNode[] = [];
  constructor(private type: 'element' | 'comment' | 'text') {}
}
