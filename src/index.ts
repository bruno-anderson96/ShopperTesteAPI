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
  measure_datetime: Date,
  measure_type: "WATER" | "GAS"
}

type updateRecord = {
  measure_uuid: string,
  confirmed_value: number
}

type Measure_Data = {
  measure_value : number,
  image_url : string,
  has_confirmed? : boolean | null
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
  { text: "Me diga apenas o valor que marca neste medidor em numero inteiro e nada mais" },
  ]);

// Output the generated text to the console
  const response = result.response.text();
  return {
    measure_value: parseFloat(response.replace(/[^\d.-]/g, '')),
    image_url: getResponse.uri
  };
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

function getMonthAndYearFromTimestamp(timestamp: Date): { month: number; year: number } {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return { month, year };
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
  const {month, year} = getMonthAndYearFromTimestamp(data.measure_datetime);

  console.log(data)
  if(!isBase64(data.image) || (data.customer_code == null) || (!data.measure_type)){
    return res.status(400).json({
      error: 'INVALID_DATA',
      message: "Os dados fornecidos no corpo da requisição são inválidos"
    });
  }

  //Checa se já existe no banco
  const rows = await query(
    `Select * from data_record where measure_type = ? and img = ? and MONTH(?) and YEAR(?)`,
    [data.measure_type, data.image, data.measure_datetime, data.measure_datetime]
    );
  if((rows as any[]).length === 0){
    const md: Measure_Data = await uploadImg();
    data.uuid = generateUUID();
    await query(
      'INSERT INTO data_record(id, measure_type, img, measure_datetime, customer_code, image_url, measure_value) VALUES (?,?,?,?,?,?,?)',
      [data.uuid, data.measure_type, data.image, data.measure_datetime, data.customer_code, md.image_url, md.measure_value]
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

});

app.patch('/confirm', async (req, res) => {
  const data: updateRecord = req.body;
  "{uuid, confirmed_value}"

  if(data.measure_uuid == null){
    return res.status(400).json({
      error: 'INVALID_DATA',
      message: "ID inválido"
    });
  }

  if(data.confirmed_value == null || typeof data.confirmed_value !== 'number'){
    return res.status(400).json({
      error: 'INVALID_DATA',
      message: "Valor de medida inválido"
    });
  }

  try{
    const rows = await query<Measure_Data>(
      `Select * from data_record where id = ?`,
      [data.measure_uuid]
      );


    if((rows as any[]).length === 0){
      return res.status(404).json({
        error: 'MEASURE_NOT_FOUND',
      message: "Leitura não encontrada." //No documento está "Leitura do mês já realizada"
    });
    }

    const record : Measure_Data = rows[0];

    if(record.has_confirmed){
      return res.status(409).json({
        error: 'CONFIRMATION_DUPLICATE',
      message: "Leitura do mês já realizada" //se já foi confirmado, é impossível alterar.
    })
    }

    if(record.measure_value == data.confirmed_value){
      await query(
        'UPDATE data_record SET has_confirmed = true where id = ?',
        [data.measure_uuid]
        );
      res.status(200).json({
      message: 'Operação realizada com sucesso, valor confirmado.', //Apenas se o valor foi igual
    });
    }else{
      await query(
        'UPDATE data_record SET measure_value = ? where id = ?',
        [data.confirmed_value, data.measure_uuid]
        );
      res.status(200).json({
      message: 'Operação realizada com sucesso, valor alterado na base de dados.', //quando altera a primeira vez, não confirma.
    });
    }

  }catch{
    return res.status(400).json({
      error: 'INVALID_DATA',
      message: "ID inválido"
    });
  }

});



// Inicia o servidor
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
