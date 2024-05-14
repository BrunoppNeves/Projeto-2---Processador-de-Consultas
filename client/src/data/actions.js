function postQuery(stringQuery, path, callbackSucess) {
    const url = `http://localhost:8080/api${path}`; 
    const data = { querySolicitada: stringQuery };
  
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(data), 
    })
      .then(response => response.json())
      .then(result => { callbackSucess(result)})
      .catch(error => {
        console.error('Erro na requisição:', error);
      });
  }
  

const ACTIONS = {
    requies:{
        postQuery
    },
    paths:{
        HELLO_WORLD : '/helloWorld',
        VERIFY_QUERY : '/verifyQuery',
        CONVERT_QUERY : '/convertQuery',
    }
}

export default ACTIONS

  