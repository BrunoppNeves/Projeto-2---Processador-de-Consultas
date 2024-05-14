import FormularioVerificarQuery from './FormularioVerificarQuery';
import React from 'react';
import Grafo from './Grafo';
function App() {
  const [consultaRealizada, setConsultaRealizada] = React.useState(false)
  const [result, setResult] = React.useState({})

  return (
    <div className="App">
      {!consultaRealizada ?
        <FormularioVerificarQuery
          handleConsultaRealizada={[consultaRealizada, setConsultaRealizada]}
          setResult={setResult}>
        </FormularioVerificarQuery>
        :
        <Grafo setConsultaRealizada={setConsultaRealizada} newGraph={result}></Grafo>
      }
    </div>
  );
}

export default App;
