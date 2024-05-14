import express, { Request, Response } from 'express';
import { Paths, Endpoint } from '../models/ApiRoutes';
import { ParseController } from '../controllers/ParseController'; // Atualize o caminho conforme necessário
import {
  RelationalOperator
} from '../models/RelationalOperator';
import { convertSQLToAlgebraRelational } from '../controllers/RelationalAlgebraController'
import { GraphElement } from '../models/GraphElement'

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

  return res.status(isValid ? 200 : 400).json({ message: `Consulta SQL ${isValid ? "válida" : "inválida"}.` })
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
    const relationalOperatorHeuristics: RelationalOperator = convertSQLToAlgebraRelational(stringQuery);

    // Função auxiliar para criar uma representação simplificada do operador relacional
    function formatOperator(operator: RelationalOperator): any {
      return {
        type: operator.type,
        expression: operator.expression,
        children: operator.children.map((child) => formatOperator(child)),
      };
    }

    // Converter a árvore de operadores para um formato JSON
    const formattedRelationalOperatorHeuristics = formatOperator(relationalOperatorHeuristics);

    // Função para construir o grafo a partir da álgebra relacional
    function buildGraphDataFromJSON(data: any, elements: GraphElement[] = [], parentId?: string): string {
      const nodeId = (elements.filter(e => e.data.id).length + 1).toString(); // Conta apenas elementos com ID para gerar novo ID
      const nodeLabel = `${data.type}: ${data.expression}`;
      elements.push({ data: { id: nodeId, label: nodeLabel } });

      if (parentId) {
        elements.push({ data: { source: parentId, target: nodeId, label: `Edge from ${parentId} to ${nodeId}` } });
      }

      data.children.forEach((child: any) => {
        buildGraphDataFromJSON(child, elements, nodeId);
      });

      return nodeId;
    }



    const graphElements: GraphElement[] = [];
    buildGraphDataFromJSON(relationalOperatorHeuristics, graphElements);
    console.log(JSON.stringify(graphElements));

    return res.status(200).json({ relationalOperatorHeuristics: formattedRelationalOperatorHeuristics });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

UserRoutes.post(Endpoint.GRAPH_QUERY, (req: Request, res: Response) => {
  const stringQuery: string = req.body.querySolicitada;

  if (typeof stringQuery !== 'string') {
    return res.status(400).json({ message: 'Consulta SQL inválida. Forneça uma string.' });
  }

  if (!parser.validateSQL(stringQuery)) {
    return res.status(400).json({ message: 'Consulta SQL inválida.' });
  }

  try {
    // Converter a consulta SQL para álgebra relacional
    const relationalOperatorHeuristics: RelationalOperator = convertSQLToAlgebraRelational(stringQuery);

    // Função auxiliar para criar uma representação simplificada do operador relacional
    function formatOperator(operator: RelationalOperator): any {
      return {
        type: operator.type,
        expression: operator.expression,
        children: operator.children.map((child) => formatOperator(child)),
      };
    }

    // Converter a árvore de operadores para um formato JSON
    const formattedRelationalOperatorHeuristics = formatOperator(relationalOperatorHeuristics);

    // Função para construir o grafo a partir da álgebra relacional
    function buildGraphDataFromJSON(data: any, elements: GraphElement[] = [], parentId?: string): string {
      const nodeId = (elements.filter(e => e.data.id).length + 1).toString(); // Conta apenas elementos com ID para gerar novo ID
      const nodeLabel = `${data.type}: ${data.expression}`;
      elements.push({ data: { id: nodeId, label: nodeLabel } });

      if (parentId) {
        elements.push({ data: { source: parentId, target: nodeId, label: `Edge from ${parentId} to ${nodeId}` } });
      }

      data.children.forEach((child: any) => {
        buildGraphDataFromJSON(child, elements, nodeId);
      });

      return nodeId;
    }

    const graphElements: GraphElement[] = [];
    buildGraphDataFromJSON(relationalOperatorHeuristics, graphElements);
    console.log(JSON.stringify(graphElements));

    return res.status(200).json({ relationalOperatorHeuristics: graphElements });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});


export default UserRoutes;
