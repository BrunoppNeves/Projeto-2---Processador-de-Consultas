// Heuristics.ts
import { RelationalOperator } from '../models/RelationalOperator';


export function applyHeuristics(projection: RelationalOperator) {
  applyProjectionAndSelectionHeuristics(projection);
  return projection;
}

function applyProjectionAndSelectionHeuristics(projection: RelationalOperator): void {
  // Encontrar todos os nós de seleção e projeção e aplicar heurísticas
  let selections = findAllNodesOfType(projection, 'Seleção');
  let projections = findAllNodesOfType(projection, 'Projeção');

  // Tentar mover seleções o mais próximo possível das suas relações base ou junções
  selections.forEach(selection => {
      tryMoveSelectionDown(selection);
  });

  // Tentar otimizar as projeções para reduzir a propagação de dados desnecessários
  projections.forEach(proj => {
      optimizeProjection(proj);
  });
}

// As funções auxiliares, como findAllNodesOfType, tryMoveSelectionDown e optimizeProjection, seriam semelhantes às já definidas anteriormente.
function findAllNodesOfType(node: RelationalOperator, type: string): RelationalOperator[] {
    let nodes: any[] = [];
    if (node.type === type) {
        nodes.push(node);
    }
    node.children.forEach(child => {
        nodes = nodes.concat(findAllNodesOfType(child, type));
    });
    return nodes;
  }
  
  function tryMoveSelectionDown(selection: RelationalOperator): void {
    let current = selection;
    while (current.parent && current.parent.type !== 'Relação' && current.parent.type !== 'Junção') {
        current = current.parent;
    }
    if (current.parent && (current.parent.type === 'Relação' || current.parent.type === 'Junção')) {
        // Desacoplar seleção e reacoplar mais perto da fonte
        let index = current.parent.children.indexOf(current);
        current.parent.children.splice(index, 1);
        current.parent.addChild(selection);
    }
  }
  
  function optimizeProjection(projection: RelationalOperator): void {
    let children = projection.children;
    // Se o filho direto for uma seleção ou junção, mover a projeção para baixo
    if (children.length === 1 && (children[0].type === 'Seleção' || children[0].type === 'Junção')) {
        let child = children[0];
        projection.children = child.children;
        child.children = [projection];
        if (projection.parent) {
            let idx = projection.parent.children.indexOf(projection);
            projection.parent.children[idx] = child;
            child.parent = projection.parent;
            projection.parent = child;
        }
    }
  }
  