import React from "react";
import '../styles/FormularioVerificarQuery.css';
import ACTIONS from "../data/actions";

const FormularioVerificarQuery = (props) => {
    const [stringQuery, setStringQuery] = React.useState('');
    const [consultaRealizada, setConsultaRealizada] = props.handleConsultaRealizada
    const [currentStateLabel, setCurrentStateLabel] = React.useState({ 'label': 'Digite a query para validação', 'color': 'black' })
    const handleChange = (event) => {
        const stringInput = event.target.value
        console.log("String -> ", stringInput)
        setStringQuery(stringInput);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (stringQuery == "") {
            throw new Error("O CAMPO DE STRING NAO DEVE SER NULO")
        }


        ACTIONS.requies.postQuery(stringQuery, ACTIONS.paths.CONVERT_QUERY,
            (result) => {
                const messageResult = result.message
                const hasMessageToCheck = messageResult != undefined

                if (hasMessageToCheck) {
                    const hasError = messageResult.includes('inválida')

                    if (hasError) {
                        setCurrentStateLabel(
                            { label: 'Sintaxe da consulta inválida ou campos inexistentes no banco. Verificar console.', color: 'red' }
                        )
                    } else {
                        props.setResult(result)
                        setConsultaRealizada(true)
                    }
                }
                console.log('Resposta do servidor:', result)
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
