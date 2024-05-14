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

    const nodeArr: { id: string, label: string }[] = [];
    const edgeArr: { source: string, target: string, label: string }[] = [];

    nodeArr.push({id: '1', label: selectFields})
    const joinIndexes = fromAndJoins.split(' ').map((value, index) => {
        return (value.trim() === 'JOIN') ? index : null;
    }).filter((value) => value !== null);


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

    function identificarTabelas(sql: string) {
        const tabelas = sql.split(', ').filter(s => s.includes('.'))
            .map(value => value.trim().split('.')[0]);
        return [...new Set(tabelas)].sort();
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

interface Node {
    type: string; // "Pi" ou "Sigma"
    value?: any; // Valor do campo para nós "Pi"
    left?: Node; // Nó filho esquerdo
    right?: Node; // Nó filho direito
}

export function createTreeFromSQL(sql: string): Node {
    // Extrair informações da consulta SQL
    const [from, joins, where] = parseSQL(sql);
    const regex = /SELECT\s+(.*?)\s+FROM\s+(.*?)(?:\s+WHERE\s+(.*))?$/i;
    const match = sql.match(regex);
    if (!match) {
        throw new Error('Consulta SQL inválida ou faltando cláusulas essenciais.');
    }

    const selectFields = match[1].trim();
    const fromAndJoins = match[2].trim();
    const whereCondition = match[3] ? match[3].trim() : '';


    // Criar nó raiz com tipo "Pi" e valor dos campos selecionados
    const root: Node = {
        type: "Pi",
        value: selectFields
    };
    // Construir subárvores recursivamente
    if (joins.length > 0) {
        const joinConditions = joins.map((join) => ({table: join.table, field1: join.field1, field2: join.field2}));
        const [left, right] = createSubtreesFromJoins(from, root.value, joinConditions, where);
        root.left = left;
        root.right = right;
    } else {
        // Se não há junções, adicionar condição WHERE como nó filho direito
        root.right = createSigmaNode(where);
    }

    return root;
}

function createPiNode(tableName: string, parentValues: any[], where: Condition[]): Node {
    
    // Criar nó "Pi" com informações da tabela e valores dos campos pai
    return {
        type: "Pi",
        value: {
            table: tableName,
            fields: parentValues,
            where,
        },
    };
}

function createSigmaNode(conditions: Condition[]): Node {
    // Criar nó "Sigma" com as condições da cláusula WHERE
    return {
        type: "Sigma",
        value: conditions,
    };
}

function createJoinNode(type: string, left: Node, right: Node, condition: Node): Node {
    // Criar nó "Join" com tipo de junção (X para inner join), nós filhos e condição
    return {
        type: "Join",
        value: {
            type,
            left,
            right,
            condition,
        },
    };
}

function createSubtreesFromJoins(
    tableName: string,
    parentValues: string[],
    joinConditions: { table: string; field1: string; field2: string }[],
    where: Condition[]
): [Node, Node] {
    // Base case: se não há mais junções, retornar subárvores para a tabela atual e a tabela de junção final
    if (joinConditions.length === 0) {
        const leftNode = createPiNode(tableName, parentValues, where);
        const rightNode = createPiNode(joinConditions[0].table, parentValues, []); // Assumir que a tabela de junção final está na última posição
        return [leftNode, rightNode];
    }

    // Recursivamente criar subárvores para cada tabela envolvida na junção
    const leftSubtrees = createSubtreesFromJoins(tableName, parentValues, joinConditions.slice(1), where);
    const rightSubtrees = createSubtreesFromJoins(joinConditions[0].table, parentValues, [], []);

    // Criar nós "Pi" para as tabelas e conectar com base nas condições de junção
    const leftPiNode = createPiNode(tableName, parentValues, where);
    const rightPiNode = createPiNode(joinConditions[0].table, parentValues, []);

    // Criar nós "Sigma" para as condições de junção
    const sigmaNode = createSigmaNode([
        {field: joinConditions[0].field1, operator: "=", value: joinConditions[0].field2},
    ]);

    // Conectar os nós de acordo com a estrutura da junção
    const leftSubtree = leftSubtrees[0];
    const rightSubtree = rightSubtrees[0];
    const leftJoinNode = createJoinNode("X", leftPiNode, leftSubtree, sigmaNode);
    const rightJoinNode = createJoinNode("X", rightPiNode, rightSubtree, sigmaNode);

    return [leftJoinNode, rightJoinNode];
}


function parseSQL(sql: string): [string, Join[], Condition[]] {
    const tokens = sql.split(/\s+/g);

    // Identificar campos selecionados
    let selectIndex = tokens.findIndex((token) => token.toLowerCase() === "select");
    if (selectIndex === -1) {
        throw new Error("Consulta SQL inválida: campo 'SELECT' não encontrado");
    }

    // Identificar nome da tabela
    let fromIndex = tokens.findIndex((token) => token.toLowerCase() === "from");
    if (fromIndex === -1) {
        throw new Error("Consulta SQL inválida: campo 'FROM' não encontrado");
    }
    const tableName = tokens[fromIndex + 1].trim();

    const regex = /SELECT\s+(.*?)\s+FROM\s+(.*?)(?:\s+WHERE\s+(.*))?$/i;
    const match = sql.match(regex);
    if (!match) {
        throw new Error('Consulta SQL inválida ou faltando cláusulas essenciais.');
    }

    const fromAndJoins = match[2].trim();
    const fromAndJoinsSplit = fromAndJoins.split(' ');
    const joinIndexes = fromAndJoinsSplit
        .map((value, index) => (value.trim() === 'JOIN') ? index : 1000)
        .filter((value) => value !== 1000);

    const joins: Join[] = [];
    while (joinIndexes.length > 0) {
        if (joinIndexes.length === 1) {
            const expression = fromAndJoinsSplit.slice(joinIndexes[0] + 1);
            joins.push({
                table: expression[0],
                field1: expression[2],
                field2: expression[4],
            });
            
        } else {
            const expression = fromAndJoinsSplit.slice(joinIndexes[0] + 1);
            joins.push({
                table: expression[0],
                field1: expression[2],
                field2: expression[4],
            });
        }
            joinIndexes.shift()
    }


    // Identificar junções (se houver)
    let joinIndex = fromIndex + 1;
    while (tokens[joinIndex].toLowerCase() === "join") {
        const joinTable = tokens[joinIndex + 1].trim();
        const onIndex = tokens.indexOf("ON", joinIndex + 2);
        if (onIndex === -1) {
            throw new Error("Consulta SQL inválida: junção sem cláusula 'ON'");
        }
        const joinCondition1 = tokens[onIndex + 1].trim();
        const joinCondition2 = tokens[onIndex + 3].trim();

        joins.push({
            table: joinTable,
            field1: joinCondition1,
            field2: joinCondition2,
        });

        joinIndex = onIndex + 4;
    }

    // Identificar condição WHERE (se houver)
    let whereIndex = tokens.findIndex((token) => token.toLowerCase() === "where");
    const whereClause = whereIndex !== -1 ? tokens.slice(whereIndex + 1) : "";
    const parsedWhere: Condition[] = parseWhereClause(whereClause);

    return [tableName, joins, parsedWhere];
}

function parseWhereClause(whereClause: string[] | ""): Condition[] {
    const conditions: Condition[] = [];

    if (Array.isArray(whereClause)) {
        whereClause = whereClause.filter(value => value !== '');
        for (let i = 0; i < whereClause.length; i += 3) {
            const field = whereClause[i].trim();
            const operator = whereClause[i + 1].trim();
            const value = whereClause[i + 2].trim();

            conditions.push({field, operator, value});

            // Verificar se há mais condições aninhadas
            if (i + 3 < whereClause.length && (whereClause[i + 3] === "AND" || whereClause[i + 3] === "OR")) {
                const nextOperator = whereClause[i + 3];
                const rightNode = createSigmaNode([{field: "dummy", operator: nextOperator, value}]); // Create temporary Sigma node for next operator
                const currentRight = conditions.pop(); // Get the last parsed condition
                conditions.push({
                    field: currentRight?.field as string,
                    operator: currentRight?.operator as string,
                    value: [currentRight?.value, rightNode]
                }); // Combine current and next condition with operator
            }
        }
    } else {
        // whereClause é uma string vazia, retornar array vazio
        return [];
    }

    return conditions;
}

interface Field {
    name: string;
    alias?: string;
}

interface Join {
    table: string;
    field1: string;
    field2: string;
}

interface Condition {
    field: string;
    operator: string;
    value: any;
}

// Rest of the code remains the same (createSubtreesFromJoins and createSigmaNode functions)
