import React from "react";
import '../styles/FormularioVerificarQuery.css';
import ACTIONS from "../data/actions";

const FormularioVerificarQuery = ({handleConsultaRealizada, setNewGraph}) => {
    const [stringQuery, setStringQuery] = React.useState('');
    const [currentStateLabel, setCurrentStateLabel] = React.useState({ 'label': 'Digite a query para validação', 'color': 'black' })
    const handleChange = (event) => {
        const stringInput = event.target.value
        setStringQuery(stringInput);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (stringQuery == "") {
            throw new Error("O CAMPO DE STRING NAO DEVE SER NULO")
        }


        ACTIONS.requies.postQuery(stringQuery, ACTIONS.paths.GRAPH_QUERY,
            (result) => {
                const messageResult = result.message
                const hasMessageToCheck = messageResult != undefined

                console.log(hasMessageToCheck)

                if (hasMessageToCheck && messageResult.includes('inválida')) {
                    setCurrentStateLabel(
                        { label: 'Sintaxe da consulta inválida ou campos inexistentes no banco. Verificar console.', color: 'red' }
                    )
                } else {
                    setNewGraph(result)
                    handleConsultaRealizada(true)
                }
                
            }
        )

        console.log("String enviada:", stringQuery);
    };

    return (
        <form id="formularioVerificarQuery" onSubmit={handleSubmit}>
            <h1 id="title" style={{ color: `${currentStateLabel.color}` }}>{`${currentStateLabel.label}`}</h1>
            <input
                type="text"
                value={stringQuery}
                onChange={handleChange}
                placeholder="Digite a string..."
            />
            <button id="botaoEnviar" type="submit">Enviar</button>
        </form>
    );
};

export default FormularioVerificarQuery;
