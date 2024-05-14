// QueryProcessor.ts
import { RelationalOperator } from '../models/RelationalOperator';

export function convertSQLToAlgebraRelational(sql: string): RelationalOperator {
  const regex = /SELECT\s+(.*?)\s+FROM\s+(.*?)(?:\s+WHERE\s+(.*))?$/i;
  const match = sql.match(regex);
  if (!match) {
    throw new Error('Consulta SQL inválida ou faltando cláusulas essenciais.');
  }

  const selectFields = match[1].trim();
  const fromAndJoins = match[2].trim();
  const whereCondition = match[3] ? match[3].trim() : '';

  const projection = new RelationalOperator('Projeção', selectFields);
  processFromAndJoins(projection, fromAndJoins);

  if (whereCondition) {
    const selection = new RelationalOperator('Seleção', whereCondition);
    projection.addChild(selection);
  }

  return projection;
}

function processFromAndJoins(projection: RelationalOperator, fromAndJoins: string) {
  const parts = fromAndJoins.split(/JOIN/i);
  let currentOperator = new RelationalOperator('Relação', parts[0].trim());
  projection.addChild(currentOperator);

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();
    const onIndex = part.indexOf("ON");
    const joinTable = part.substring(0, onIndex).trim();
    const onCondition = part.substring(onIndex + 3).trim();
    const joinOperator = new RelationalOperator('Junção', `${joinTable} ON ${onCondition}`, currentOperator);
    currentOperator.addChild(joinOperator);
    currentOperator = joinOperator;
  }
}

