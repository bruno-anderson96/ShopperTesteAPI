import 'dotenv/config';
import express from 'express';
import { query } from './database';
import { v4 as uuidv4 } from 'uuid';

const geminiApiKey = process.env.GEMINI_API_KEY;

const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleAIFileManager } from "@google/generative-ai/server";

type Record = {
  uuid: string,
  image: string,
  customer_code: string,
  measure_datetime: Date;
  measure_type: "WATER" | "GAS" ;
}

async function uploadImg(){

// Access your API key as an environment variable
  const genAI = new GoogleGenerativeAI(geminiApiKey as string);

  const fileManager = new GoogleAIFileManager(geminiApiKey as string);

  const uploadResponse = await fileManager.uploadFile("src/img/medidor2.jpg", {
    mimeType: "image/jpeg",
    displayName: "Medidor",
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

function isBase64(str: string): boolean {
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  return base64Pattern.test(str) && str.length % 4 === 0;
}

function isValidMeasureType(type: string): type is "WATER" | "GAS" {
  const UpperFormat = type.toUpperCase();
  return type === "WATER" || type === "GAS";
}

function generateUUID(): string {
  return uuidv4();
}


// uploadImg();


const app = express();
const port = 3000;

// Middleware para analisar o corpo das requisições em JSON
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  // Define o código de status 200 e envia uma resposta JSON personalizada
  res.status(200).json({
    message: 'Hello Shopper',
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
  try{
    const results = await query("Select * from data_record");
    res.status(200).json(results);
  }catch(error){
    res.status(500).json({ error: "Check your database"})
  }

});

app.post('/upload', async (req, res) => {
  const data: Record = req.body;
//, customer_code, measure_datetime, measure_type
  data.measure_datetime = new Date();
  console.log(data)
  if(!isBase64(data.image) || (data.customer_code == null) || (!data.measure_type)){
    return res.status(400).json({
      error: 'INVALID_DATA',
      message: "Os dados fornecidos no corpo da requisição são inválidos"
    });
  }

  //Checa se já existe no banco
    const rows = await query(
      `Select * from data_record where measure_type = ? and img = ?`,
      [data.measure_type, data.image]
      );
    if((rows as any[]).length === 0){
      data.uuid = generateUUID();
      await query(
        'INSERT INTO data_record(id, measure_type, img, measure_datetime, customer_code) VALUES (?,?,?,?,?)',
        [data.uuid, data.measure_type, data.image, data.measure_datetime, data.customer_code]
        );

      res.status(200).json({
        message: 'Novo registro de medição adicionado com sucesso',
        timestamp: new Date().toISOString()
      });
    }else{
      return res.status(409).json({
      error: 'DOUBLE_REPORT',
      message: "Leitura do mês já realizada"
    
  })
    }
 

  //Adicionar aqui:
  // {"image_url" : string,
  // "measure_value" : integer,
  // "measure_uuid" : string
  // }
  

});

// Inicia o servidor
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
