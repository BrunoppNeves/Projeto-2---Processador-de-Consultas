import express, { Request, Response } from 'express';
import { Paths, Endpoint } from '../models/ApiRoutes';
import { ParseController } from '../controllers/ParseController'; // Atualize o caminho conforme necessário
import {
  RelationalOperator,
  convertSQLToAlgebraRelational,
} from '../controllers/RelationalAlgebraController';

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
    return res.status(400).json({ message: 'Input inválido. Forneça uma string.' });
  }


  const isValid = parser.validateSQL(stringQuery);

  return res.status(isValid ? 200 : 400).json({message : `Consulta SQL ${isValid ? "válida" : "inválida"}.`})
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
