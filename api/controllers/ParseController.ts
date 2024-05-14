import {validate} from 'mysql-query-validator';

type DataBase = {
    schema: string;
    tables: Array<{
        name: string;
        columns: Array<{ name: string; type: string; notNull?: boolean; default?: string; autoIncrement?: boolean }>;
        primaryKey: string[];
        foreignKey?: Array<{ column: string; references: { table: string; column: string } }>;
    }>;
};

export class ParseController {

    validateSQL(sqlString: string): boolean {
        const validarSintaxe: boolean = this.isSqlValid(sqlString)
        const validarCamposDoBanco: boolean = this.validateSqlWithSchema(sqlString)

        return validarSintaxe && validarCamposDoBanco;
    }

    isSqlValid(sql: string): boolean {
        try {
            validate(sql);
            return true;
        } catch (error) {

            console.log("ERRO DE SINTAXE -->", error)
            return false;
        }
    }

    validateSqlWithSchema(sql: string): boolean {
        const database: DataBase = this.DATA_BASE
        const tableNames = new Set(database.tables.map(table => table.name));
        const columnNames = new Set(database.tables.flatMap(table => table.columns.map(column => column.name)));

        const usesSelectAll = sql.toUpperCase().includes('SELECT *');

        const sqlTableNames = new Set(sql.match(/(?<=FROM|JOIN)\s+\w+/gi)?.map(name => name.trim()) || []);
        const sqlColumnNames = usesSelectAll ? new Set() : new Set(sql.match(/\w+(?=\s*(=|>|<|>=|<=|<>))/gi) || []);

        const selectFields = sql.match(/(?<=SELECT\s).+(?=\sFROM)/gi)?.[0].split(',').map(field => field.trim());

        if (selectFields && !usesSelectAll) {
            for (const field of selectFields) {
                if (!field.includes('.') && !columnNames.has(field)) {
                    return false;
                } else if (field.includes('.')) {
                    const split = field.split('.');
                    if (!tableNames.has(split[0])) return false;
                    else if (!columnNames.has(split[1])) return false;
                }
            }
        }

        for (const tableName of Array.from(sqlTableNames)) {
            if (!tableNames.has(tableName)) {
                return false;
            }
        }

        for (const columnName of Array.from(sqlColumnNames)) {
            const ehString = typeof columnName === 'string'

            if (ehString && !columnNames.has(columnName)) {
                return false;
            }
        }

        return true;
    }

    static getDataBase() {
        return new ParseController().DATA_BASE;
    }

    private readonly DATA_BASE = {
        "schema": "BD_Vendas",
        "tables": [
            {
                "name": "Categoria",
                "columns": [
                    {"name": "idCategoria", "type": "INT", "notNull": true},
                    {"name": "Descricao", "type": "VARCHAR(45)", "notNull": true}
                ],
                "primaryKey": ["idCategoria"]
            },
            {
                "name": "Produto",
                "columns": [
                    {"name": "idProduto", "type": "INT", "notNull": true},
                    {"name": "Nome", "type": "VARCHAR(45)", "notNull": true},
                    {"name": "Descricao", "type": "VARCHAR(200)"},
                    {"name": "Preco", "type": "DECIMAL(18,2)", "notNull": true, "default": "0"},
                    {"name": "QuantEstoque", "type": "DECIMAL(10,2)", "notNull": true, "default": "0"},
                    {"name": "Categoria_idCategoria", "type": "INT", "notNull": true}
                ],
                "primaryKey": ["idProduto"],
                "foreignKey": [
                    {"column": "Categoria_idCategoria", "references": {"table": "Categoria", "column": "idCategoria"}}
                ]
            },
            {
                "name": "TipoCliente",
                "columns": [
                    {"name": "idTipoCliente", "type": "INT", "notNull": true},
                    {"name": "Descricao", "type": "VARCHAR(45)"}
                ],
                "primaryKey": ["idTipoCliente"]
            },
            {
                "name": "Cliente",
                "columns": [
                    {"name": "idCliente", "type": "INT", "notNull": true},
                    {"name": "Nome", "type": "VARCHAR(45)", "notNull": true},
                    {"name": "Email", "type": "VARCHAR(100)", "notNull": true},
                    {"name": "Nascimento", "type": "DATETIME"},
                    {"name": "Senha", "type": "VARCHAR(200)"},
                    {"name": "TipoCliente_idTipoCliente", "type": "INT", "notNull": true},
                    {"name": "DataRegistro", "type": "DATETIME", "notNull": true, "default": "Now()"}
                ],
                "primaryKey": ["idCliente"],
                "foreignKey": [
                    {
                        "column": "TipoCliente_idTipoCliente",
                        "references": {"table": "TipoCliente", "column": "idTipoCliente"}
                    }
                ]
            },
            {
                "name": "TipoEndereco",
                "columns": [
                    {"name": "idTipoEndereco", "type": "INT", "notNull": true},
                    {"name": "Descricao", "type": "VARCHAR(45)", "notNull": true}
                ],
                "primaryKey": ["idTipoEndereco"]
            },
            {
                "name": "Endereco",
                "columns": [
                    {"name": "idEndereco", "type": "INT", "notNull": true},
                    {"name": "EnderecoPadrao", "type": "TINYINT", "notNull": true, "default": "0"},
                    {"name": "Logradouro", "type": "VARCHAR(45)"},
                    {"name": "Numero", "type": "VARCHAR(45)"},
                    {"name": "Complemento", "type": "VARCHAR(45)"},
                    {"name": "Bairro", "type": "VARCHAR(45)"},
                    {"name": "Cidade", "type": "VARCHAR(45)"},
                    {"name": "UF", "type": "VARCHAR(2)"},
                    {"name": "CEP", "type": "VARCHAR(8)"},
                    {"name": "TipoEndereco_idTipoEndereco", "type": "INT", "notNull": true},
                    {"name": "Cliente_idCliente", "type": "INT", "notNull": true}
                ],
                "primaryKey": ["idEndereco"],
                "foreignKey": [
                    {
                        "column": "TipoEndereco_idTipoEndereco",
                        "references": {"table": "TipoEndereco", "column": "idTipoEndereco"}
                    },
                    {"column": "Cliente_idCliente", "references": {"table": "Cliente", "column": "idCliente"}}
                ]
            },
            {
                "name": "Telefone",
                "columns": [
                    {"name": "Numero", "type": "VARCHAR(42)", "notNull": true},
                    {"name": "Cliente_idCliente", "type": "INT", "notNull": true}
                ],
                "primaryKey": ["Numero", "Cliente_idCliente"],
                "foreignKey": [
                    {"column": "Cliente_idCliente", "references": {"table": "Cliente", "column": "idCliente"}}
                ]
            },
            {
                "name": "Status",
                "columns": [
                    {"name": "idStatus", "type": "INT", "notNull": true},
                    {"name": "Descricao", "type": "VARCHAR(45)", "notNull": true}
                ],
                "primaryKey": ["idStatus"]
            },
            {
                "name": "Pedido",
                "columns": [
                    {"name": "idPedido", "type": "INT", "notNull": true},
                    {"name": "Status_idStatus", "type": "INT", "notNull": true},
                    {"name": "DataPedido", "type": "DATETIME", "notNull": true, "default": "Now()"},
                    {"name": "ValorTotalPedido", "type": "DECIMAL(18,2)", "notNull": true, "default": "0"},
                    {"name": "Cliente_idCliente", "type": "INT", "notNull": true}
                ],
                "primaryKey": ["idPedido"],
                "foreignKey": [
                    {"column": "Status_idStatus", "references": {"table": "Status", "column": "idStatus"}},
                    {"column": "Cliente_idCliente", "references": {"table": "Cliente", "column": "idCliente"}}
                ]
            },
            {
                "name": "Pedido_has_Produto",
                "columns": [
                    {"name": "idPedidoProduto", "type": "INT", "notNull": true, "autoIncrement": true},
                    {"name": "Pedido_idPedido", "type": "INT", "notNull": true},
                    {"name": "Produto_idProduto", "type": "INT", "notNull": true},
                    {"name": "Quantidade", "type": "DECIMAL(10,2)", "notNull": true},
                    {"name": "PrecoUnitario", "type": "DECIMAL(18,2)", "notNull": true}
                ],
                "primaryKey": ["idPedidoProduto"],
                "foreignKey": [
                    {"column": "Pedido_idPedido", "references": {"table": "Pedido", "column": "idPedido"}},
                    {"column": "Produto_idProduto", "references": {"table": "Produto", "column": "idProduto"}}
                ]
            }
        ]
    }

}


