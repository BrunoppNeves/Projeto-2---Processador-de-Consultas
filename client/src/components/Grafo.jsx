import React, { useState } from 'react'
import CytoscapeComponent from 'react-cytoscapejs';

export default function Grafo({newGraph, setConsultaRealizada}) {
    const [width, setWith] = useState("100%");
    const [height, setHeight] = useState("400px");
    const [graphData, setGraphData] = useState([
        //Node format
        { data: { id: '1', label: 'Node 1' } },
        { data: { id: '2', label: 'Node 2' } },
        { data: { id: '3', label: 'Node 3' } },
        { data: { id: '4', label: 'Node 4' } },
        { data: { id: '5', label: 'Node 5' } },
        { data: { id: '6', label: 'Node 6' } },
        { data: { id: '7', label: 'Node 7' } },
        { data: { id: '8', label: 'Node 8' } },
        //Edge format
        { data: { source: '1', target: '2', label: 'Edge from 1 to 2' } },
        { data: { source: '1', target: '3', label: 'Edge from 1 to 3' } },
        { data: { source: '4', target: '5', label: 'Edge from 4 to 5' } },
        { data: { source: '6', target: '8', label: 'Edge from 6 to 8' } },
    ]);

    const styleNodesAndEdges = [
        {
            selector: "node",
            style: {
                backgroundColor: "#555",
                width: 60,
                height: 60,
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
                "line-color": "#6774cb",
                "line-color": "#AAD8FF",
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

    React.useEffect(()=>{
        console.log("Novo grafo")
    },[newGraph])

    return (
        <>
            <div>
                <h1 style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>Grafico Resultante</h1>
                <div
                    style={{
                        border: "1px solid",
                        backgroundColor: "#f5f6fe"
                    }}
                >
                    <CytoscapeComponent
                        elements={graphData}
                        style={{ width: width, height: height }}
                        layout={{
                            name: 'breadthfirst',
                            fit: true,
                            directed: true,
                            padding: 50,
                            animate: true,
                            animationDuration: 1000,
                            avoidOverlap: true,
                            nodeDimensionsIncludeLabels: false
                        }}
                        stylesheet={styleNodesAndEdges}
                    />
                <button 
                    id="botaoEnviar" 
                    onClick={()=>{setConsultaRealizada(false)}}
                    style={{
                        "padding": "15px 30px",
                        "background-color": "#0056b3",
                        "color": "white",
                        "border": "none",
                        "border-radius": "10px",
                        "cursor": "pointer",
                        "transition": "background-color 0.3s ease"
                      }
                      }
                >
                        Realizar nova conversão
                </button>
                </div>
            </div>
        </>
    );
}