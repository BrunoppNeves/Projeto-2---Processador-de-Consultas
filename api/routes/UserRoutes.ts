import express, { Request, Response } from 'express';
import { Paths, Endpoint } from '../models/ApiRoutes';
import { ParseController } from '../controllers/ParseController'; // Atualize o caminho conforme necessário
import {
  RelationalOperator,
  convertSQLToAlgebraRelational,
} from '../controllers/RelationalAlgebraController';

// Instância do controlador de parsing
const parser = new ParseController();

const UserRoutes = express.Router().use(express.json());

UserRoutes.get(Endpoint.HELLO_WORLD, (req: Request, res: Response) => {
  const value: string = 'HELLO WORLD!';
  return res.json({
    resultado: value,
  });
});

UserRoutes.post(Endpoint.VERIFY_QUERY, (req: Request, res: Response) => {
  const stringQuery: string = req.body.querySolicitada;

  if (typeof stringQuery !== 'string') {
    return res.status(400).json({ message: 'Consulta SQL inválida. Forneça uma string.' });
  }

  // Validar a consulta SQL usando o ParseController
  const isValid = parser.validateSQL(stringQuery);
  if (isValid) {
    return res.status(200).json({ message: 'Consulta SQL válida.' });
  } else {
    return res.status(400).json({ message: 'Consulta SQL inválida.' });
  }
});

UserRoutes.post(Endpoint.CONVERT_QUERY, (req: Request, res: Response) => {
  const stringQuery: string = req.body.querySolicitada;

  if (typeof stringQuery !== 'string') {
    return res.status(400).json({ message: 'Consulta SQL inválida. Forneça uma string.' });
  }

  if (!parser.validateSQL(stringQuery)) {
    return res.status(400).json({ message: 'Consulta SQL inválida.' });
  }

  try {
    // Converter a consulta SQL para álgebra relacional
    const relationalOperator: RelationalOperator = convertSQLToAlgebraRelational(stringQuery);

    // Função auxiliar para criar uma representação simplificada do operador relacional
    function formatOperator(operator: RelationalOperator): any {
      return {
        type: operator.type,
        expression: operator.expression,
        children: operator.children.map((child) => formatOperator(child)),
      };
    }

    // Converter a árvore de operadores para um formato JSON
    const formattedRelationalOperator = formatOperator(relationalOperator);

    return res.status(200).json({ relationalOperator: formattedRelationalOperator });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

export default UserRoutes;
