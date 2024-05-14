// RelationalOperator.ts
export class RelationalOperator {
    type: string;
    expression: string;
    children: RelationalOperator[];
    parent?: RelationalOperator; // Optional parent reference
  
    constructor(type: string, expression: string, parent?: RelationalOperator) {
      this.type = type;
      this.expression = expression;
      this.children = [];
      this.parent = parent;
    }
  
    addChild(operator: RelationalOperator): void {
      operator.parent = this;
      this.children.push(operator);
    }
  
    printOperator(indent = 0): void {
      const indentStr = ' '.repeat(indent);
      console.log(`${indentStr}${this.type}: ${this.expression}`);
      this.children.forEach(child => child.printOperator(indent + 2));
    }
  }
  