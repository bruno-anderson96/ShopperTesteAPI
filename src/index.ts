import 'dotenv/config';
import express from 'express';
import { query } from './database';

const geminiApiKey = process.env.GEMINI_API_KEY;

const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleAIFileManager } from "@google/generative-ai/server";

async function uploadImg(){

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(geminiApiKey as string);

const fileManager = new GoogleAIFileManager(geminiApiKey as string);

const uploadResponse = await fileManager.uploadFile("src/img/medidor2.jpg", {
  mimeType: "image/jpeg",
  displayName: "drawing",
});

console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

const getResponse = await fileManager.getFile(uploadResponse.file.name);

console.log(`Retrieved file ${getResponse.displayName} as ${getResponse.uri}`);

//
const model = genAI.getGenerativeModel({
  // Choose a Gemini model.
  model: "gemini-1.5-pro",
});

// Upload file ...

// Generate content using text and the URI reference for the uploaded file.
const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri
      }
    },
    { text: "Nessa imagem está medindo o consumo de que ? e qual valor ?" },
  ]);

// Output the generated text to the console
console.log(result.response.text())
};


uploadImg();


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
