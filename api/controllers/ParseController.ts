export class ParseController {
  // Critérios de cláusulas e operadores
  private readonly CLAUSES: string[] = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'ON'];
  private readonly OPERATORS: string[] = ['=', '>', '<', '<=', '>=', '<>', 'AND', ','];

  // Método principal para validar a consulta SQL
  validateSQL(sqlString: string): boolean {
    if (this.validateSyntax(sqlString)) {
      return true; // Caso deseje validar mais algum critério no futuro, pode-se incluir aqui
    }
    return false;
  }

  // Verificação de sintaxe e operadores válidos
  validateSyntax(sqlString: string): boolean {
    // Contagem de parênteses
    let openCount = 0;
    for (const char of sqlString) {
      if (char === '(') openCount++;
      else if (char === ')') openCount--;
    }
    if (openCount !== 0) {
      console.error('Erro de parênteses não correspondentes.');
      return false;
    }

    // Verificar a presença das cláusulas essenciais `SELECT` e `FROM`
    const selectRegex = /^SELECT\s+(.+?)\s+FROM\s+(.+?)(\s+WHERE\s+(.+?))?$/i;
    const match = selectRegex.exec(sqlString);
    if (!match) {
      console.error(
        'Sintaxe SQL inválida. Verifique se todas as cláusulas obrigatórias estão presentes.'
      );
      return false;
    }

    // Verificar operadores e comparações na cláusula WHERE (se existente)
    if (match[3]) {
      const whereClause = match[4];
      const whereRegex = /([a-zA-Z0-9_\.]+)\s*(=|>|<|<=|>=|<>|AND|OR)\s*([a-zA-Z0-9_'\.\s]+)/gi;
      let validOperators;
      while ((validOperators = whereRegex.exec(whereClause)) !== null) {
        if (!this.OPERATORS.includes(validOperators[2].toUpperCase())) {
          console.error(`Operador inválido encontrado na cláusula WHERE: ${validOperators[2]}`);
          return false;
        }
      }
    }

    console.log('Sintaxe SQL válida.');
    return true;
  }
}
