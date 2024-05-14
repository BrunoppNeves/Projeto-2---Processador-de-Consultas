import FormularioVerificarQuery from './FormularioVerificarQuery';
import React from 'react';
import Grafo from './Grafo';
function App() {
  const [consultaRealizada, setConsultaRealizada] = React.useState(false)
  const [result, setResult] = React.useState({})

  return (
    <div>
      {!consultaRealizada ?
        <FormularioVerificarQuery
          handleConsultaRealizada={setConsultaRealizada}
          setNewGraph={setResult}>
        </FormularioVerificarQuery>
        :
        <Grafo setConsultaRealizada={setConsultaRealizada} newGraph={result}></Grafo>
      }
    </div>
  );
}

export default App;
