export class RelationalOperator {
  type: string;
  expression: string;
  children: RelationalOperator[];
  parent?: RelationalOperator; // Optional parent reference

  constructor(type: string, expression: string, parent?: RelationalOperator) {
    this.type = type;
    this.expression = expression;
    this.children = [];
    this.parent = parent; // Store the parent operator
  }

  addChild(operator: RelationalOperator): void {
    operator.parent = this; // Set this operator as the parent of the child
    this.children.push(operator);
  }

  printOperator(indent = 0): void {
    const indentStr = ' '.repeat(indent);
    console.log(`${indentStr}${this.type}: ${this.expression}`);
    this.children.forEach(child => child.printOperator(indent + 2));
  }
}

export function convertSQLToAlgebraRelational(sql: string, applyHeuristics: boolean = true): RelationalOperator {
  // Regex to parse SELECT, FROM, JOINs and WHERE parts of the SQL query
  const regex = /SELECT\s+(.*?)\s+FROM\s+(.*?)(?:\s+WHERE\s+(.*))?$/i;
  const match = sql.match(regex);
  if (!match) {
    throw new Error('Consulta SQL inválida ou faltando cláusulas essenciais.');
  }

  const selectFields = match[1].trim();
  const fromAndJoins = match[2].trim();
  const whereCondition = match[3] ? match[3].trim() : '';

  // Initialize projection operator
  const projection = new RelationalOperator('Projeção', selectFields);

  // Process FROM and JOINs
  const parts = fromAndJoins.split(/JOIN/i);
  let baseRelation = new RelationalOperator('Relação', parts[0].trim());
  projection.addChild(baseRelation);

  // Process each JOIN part
  for (let i = 1; i < parts.length; i++) {
    const joinPart = parts[i].trim();
    const onIndex = joinPart.indexOf("ON");
    const joinTable = joinPart.substring(0, onIndex).trim();
    const onCondition = joinPart.substring(onIndex + 2).trim();
    const joinOperator = new RelationalOperator('Junção', `${joinTable} ON ${onCondition}`);
    baseRelation.addChild(joinOperator);
    baseRelation = joinOperator; // Move the base relation forward to the latest join
  }

  // Process WHERE clause if present
  if (whereCondition) {
    const selection = new RelationalOperator('Seleção', whereCondition);
    baseRelation.addChild(selection); // Add WHERE condition to the last relation/join
  }

  if (applyHeuristics) {
    // Simplificar a expressão de projeção removendo espaços extras e garantindo unicidade dos campos
    const projectionFields = selectFields.split(',')
                                         .map(field => field.trim())
                                         .filter((value, index, self) => self.indexOf(value) === index);
    projection.expression = projectionFields.join(', ');

    // Reordenar os operadores para otimizar a consulta
    // Mover Seleções para baixo na árvore para ficarem mais próximas das suas tabelas relacionadas
    if (whereCondition) {
        // Encontrar o operador de seleção na árvore
        const selectionOperator = findSelectionOperator(projection);
        if (selectionOperator) {
            moveSelectionCloserToRelation(selectionOperator);
        }
    }
}

function findSelectionOperator(operator: RelationalOperator): RelationalOperator | null {
  if (operator.type === 'Seleção') {
    return operator;
  }
  for (const child of operator.children) {
    const found = findSelectionOperator(child);
    if (found) {
      return found;
    }
  }
  return null;
}

function moveSelectionCloserToRelation(selection: RelationalOperator): void {
  let parent = selection.parent; // This now correctly references the parent
  if (parent && parent.type !== 'Relação') {
    let grandParent = parent.parent; // Correctly access the grandparent
    if (grandParent) {
      // Remove selection from the current parent
      parent.children = parent.children.filter((child: RelationalOperator) => child !== selection);
      // Add selection to the grandparent, if not a 'Projeção'
      if (grandParent.type !== 'Projeção') {
        grandParent.addChild(selection);
      }
    }
  }
}

  return projection;
}
