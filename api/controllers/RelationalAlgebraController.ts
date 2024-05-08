// Representa uma operação relacional
export class RelationalOperator {
  type: string; // Tipo da operação (e.g., Projeção, Seleção, etc.)
  expression: string; // Expressão ou condição
  children: RelationalOperator[]; // Filhos (operações seguintes)

  constructor(type: string, expression: string) {
    this.type = type;
    this.expression = expression;
    this.children = [];
  }

  addChild(operator: RelationalOperator): void {
    this.children.push(operator);
  }

  // Imprime as operações e suas relações
  printOperator(indent = 0): void {
    const indentStr = ' '.repeat(indent);
    console.log(`${indentStr}${this.type}: ${this.expression}`);
    this.children.forEach((child) => {
      child.printOperator(indent + 2);
    });
  }
}

// Função que converte SQL para álgebra relacional
export function convertSQLToAlgebraRelational(sql: string): RelationalOperator {
  // Identificar projeção, seleção e junção
  const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM\s+(.+?)(\s+WHERE\s+(.*))?/i);

  // Verificar se a consulta possui a estrutura básica necessária
  if (!selectMatch) {
    throw new Error('Consulta SQL inválida ou faltando cláusulas essenciais.');
  }

  const selectFields = selectMatch[1].trim();
  const fromTable = selectMatch[2].trim();
  const whereClause = selectMatch[4] ? selectMatch[4].trim() : '';

  // Criar a operação de projeção como raiz do grafo
  const projectionRoot = new RelationalOperator('Projeção', selectFields);

  // Criar a operação de seleção (caso exista WHERE)
  if (whereClause) {
    const selection = new RelationalOperator('Seleção', whereClause);
    projectionRoot.addChild(selection);

    // Adicionar a tabela como base da seleção
    const baseTable = new RelationalOperator('Relação', fromTable);
    selection.addChild(baseTable);
  } else {
    // Sem WHERE, a projeção é diretamente na tabela base
    const baseTable = new RelationalOperator('Relação', fromTable);
    projectionRoot.addChild(baseTable);
  }

  return projectionRoot;
}
