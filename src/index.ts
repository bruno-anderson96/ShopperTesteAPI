import express from 'express';
import { query } from './database';

const app = express();
const port = 3000;

// Middleware para analisar o corpo das requisições em JSON
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  // Define o código de status 200 e envia uma resposta JSON personalizada
  res.status(200).json({
    message: 'Hello World',
    timestamp: new Date().toISOString()
  });

  res.status(400).json({
    message: 'Erro',
  });
});

app.get('/teste', (req, res) => {
  // Define o código de status 200 e envia uma resposta JSON personalizada
  const { param } = req.query;

  if(!param){
    return res.status(400).json({
      error: 'Bad Request',
      message: "Missing param"
    });
  }

  res.status(200).json({
    message: 'Teste concluido com sucesso',
    timestamp: new Date().toISOString()
  });

});

app.get('/records', async (req, res) => {
  // Define o código de status 200 e envia uma resposta JSON personalizada
  try{
    const results = await query("Select * from data_record");
    res.status(200).json(results);
  }catch(error){
    res.status(500).json({ error: "Check your database"})
  }

});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
