import React, { useState } from 'react'
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

export default function Grafo({ newGraph, setConsultaRealizada }) {
    const [width, setWith] = useState("100%");
    const [height, setHeight] = useState("400px");
    const [graphData, setGraphData] = useState([{ "data": { "id": "1", "label": "Projeção: Nome, Email" } }, { "data": { "id": "2", "label": "Seleção: idCliente = 1" } }, { "data": { "id": "3", "label": "Relação: Cliente" } }, { "data": { "id": "4", "label": "Junção: Endereco ON Cliente_idCliente = idCliente" } }]);

    React.useEffect(() => {
        setGraphData(newGraph.relationalOperatorHeuristics)
    }, [newGraph])


    cytoscape.use(dagre);
    const styleNodesAndEdges = [
        {
            selector: "node",
            style: {
                backgroundColor: "#555",
                width: 20,
                height: 20,
                label: "data(label)",
                "text-valign": "center",
                "text-halign": "center",
                "text-outline-color": "#555",
                "text-outline-width": "2px",
                "overlay-padding": "6px",
                "z-index": "10"
            }
        },
        {
            selector: "node:selected",
            style: {
                "border-width": "6px",
                "border-color": "#AAD8FF",
                "border-opacity": "0.5",
                "background-color": "#77828C",
                "text-outline-color": "#77828C"
            }
        },
        {
            selector: "label",
            style: {
                color: "white",
                width: 30,
                height: 30,
                fontSize: 30
                // shape: "rectangle"
            }
        },
        {
            selector: "edge",
            style: {
                width: 8,
                "line-color": "red",
                "line-color": "red",
                "target-arrow-color": "#6774cb",
                "target-arrow-shape": "triangle",
                "curve-style": "bezier",
                label: "data(label)", // Adicione esta linha para exibir os rótulos
                "text-background-color": "#fff", // Cor de fundo do rótulo
                "text-background-opacity": 0.7, // Opacidade do fundo do rótulo
                "text-background-padding": "3px", // Espaçamento do fundo do rótulo
                "text-background-shape": "roundrectangle", // Forma do fundo do rótulo
                "text-background-color": "#555", // Cor do fundo do rótulo
                "text-background-opacity": 0.7, // Opacidade do fundo do rótulo
                "text-background-padding": "3px", // Espaçamento do fundo do rótulo
                "text-background-shape": "roundrectangle", // Forma do fundo do rótulo
                "text-border-color": "#555", // Cor da borda do rótulo
                "text-border-width": "1px", // Largura da borda do rótulo
                "text-border-opacity": 0.7, // Opacidade da borda do rótulo
                "text-border-padding": "3px", // Espaçamento da borda do rótulo
                "text-border-radius": "3px", // Raio da borda do rótulo
                "text-border-style": "solid", // Estilo da borda do rótulo
                "text-border-width": "1px", // Largura da borda do rótulo
                "text-opacity": 1, // Opacidade do rótulo
                "text-valign": "center", // Alinhamento vertical do rótulo
                "text-halign": "center", // Alinhamento horizontal do rótulo
                color: "#fff", // Cor do texto do rótulo
                "font-size": 12, // Tamanho da fonte do rótulo
            }
        }
    ]
    return (
            <div
                style={{
                    border: "1px solid",
                    backgroundColor: "#f5f6fe",
                    width: "100%" // Adicionando estilo para ocupar todo o espaço horizontal
                }}
            >
                <CytoscapeComponent
                    elements={graphData}
                    style={{ width: width, height: height }}
                    layout={{
                        name: 'dagre',
                        fit: true,
                        directed: true,
                        padding: 50,
                        avoidOverlap: true,
                        nodeDimensionsIncludeLabels: true,
                        rankDir: 'TB'
                    }}
                    stylesheet={styleNodesAndEdges}
                />
                <button
                    id="botaoEnviar"
                    onClick={() => { setConsultaRealizada(false) }}
                    style={{
                        "padding": "15px 30px",
                        "backgroundColor": "#0056b3",
                        "color": "white",
                        "border": "none",
                        "borderRadius": "10px",
                        "cursor": "pointer",
                        "transition": "background-color 0.3s ease"
                    }}
                >
                    Realizar nova conversão
                </button>
            </div>
    );
}