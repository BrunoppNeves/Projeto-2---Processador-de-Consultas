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


UserRoutes.post(Endpoint.GRAPH_QUERY, (req: Request, res: Response) => {
  const stringQuery: string = req.body.querySolicitada;

  if (typeof stringQuery !== 'string') {
    return res.status(400).json({ message: 'Consulta SQL inválida. Forneça uma string.' });
  }

  if (!parser.validateSQL(stringQuery)) { 
    return res.status(400).json({ message: 'Consulta SQL inválida.' });
  }

  try {
    const relationalOperatorHeuristics: RelationalOperator = convertSQLToAlgebraRelational(stringQuery);

    const graphElements: GraphElement[] = [];
    buildGraphDataFromJSON(relationalOperatorHeuristics, graphElements);
    console.log(JSON.stringify(graphElements));

    return res.status(200).json({ relationalOperatorHeuristics: graphElements });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

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

export default UserRoutes;
