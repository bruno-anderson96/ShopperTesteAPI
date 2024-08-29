"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const database_1 = require("./database");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const geminiApiKey = process.env.GEMINI_API_KEY;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const server_1 = require("@google/generative-ai/server");
function uploadImg(base64Image) {
    return __awaiter(this, void 0, void 0, function* () {
        // try{
        // Access your API key as an environment variable
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const fileManager = new server_1.GoogleAIFileManager(geminiApiKey);
        console.log(saveBase64ToTempFile(base64Image));
        const uploadResponse = yield fileManager.uploadFile(saveBase64ToTempFile(base64Image), {
            mimeType: "image/jpeg",
            displayName: "Medidor",
        });
        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);
        const getResponse = yield fileManager.getFile(uploadResponse.file.name);
        console.log(`Retrieved file ${getResponse.displayName} as ${getResponse.uri}`);
        const model = genAI.getGenerativeModel({
            // Choose a Gemini model.
            model: "gemini-1.5-pro",
        });
        // Generate content using text and the URI reference for the uploaded file.
        const result = yield model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                }
            },
            { text: "Me diga apenas o valor que marca neste medidor em numero inteiro e nada mais" },
        ]);
        // Output the generated text to the console
        const response = yield result.response.text();
        return {
            measure_value: parseFloat(response.replace(/[^\d.-]/g, '')),
            image_url: getResponse.uri
        };
        //   }catch{
        //   return {
        //     measure_value: 0,
        //     image_url: ''
        //   };
        // }
    });
}
;
function isBase64(str) {
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    return base64Pattern.test(str) && str.length % 4 === 0;
}
function isValidMeasureType(type) {
    const UpperFormat = type.toUpperCase();
    return type === "WATER" || type === "GAS";
}
function generateUUID() {
    return (0, uuid_1.v4)();
}
function getMonthAndYearFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return { month, year };
}
const saveBase64ToTempFile = (base64Image) => {
    // Extrair a parte da imagem Base64 (remover o prefixo "data:image/jpeg;base64,")
    const base64Data = base64Image.replace(/^data:image\/jpeg;base64,/, '');
    // Converter a string Base64 para um Buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    // Definir o caminho do arquivo temporário
    const tempFilePath = path.join(__dirname, 'medidor.jpg');
    // Salvar o Buffer em um arquivo
    fs.writeFileSync(tempFilePath, imageBuffer);
    // Retornar o caminho do arquivo temporário
    return tempFilePath;
};
// uploadImg();
const app = (0, express_1.default)();
const port = 3000;
// Middleware para analisar o corpo das requisições em JSON
app.use(express_1.default.json());
// Rota principal
app.get('/', (req, res) => {
    // Define o código de status 200 e envia uma resposta JSON personalizada
    res.status(200).json({
        message: 'Hello Shopper teste',
        timestamp: new Date().toISOString()
    });
    res.status(400).json({
        message: 'Erro',
    });
});
app.get('/teste', (req, res) => {
    // Define o código de status 200 e envia uma resposta JSON personalizada
    const { param } = req.query;
    if (!param) {
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
app.get('/records', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield (0, database_1.query)("Select * from data_record");
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json({ error: "Check your database" });
    }
}));
app.post('/upload', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    //, customer_code, measure_datetime, measure_type
    data.measure_datetime = new Date();
    const { month, year } = getMonthAndYearFromTimestamp(data.measure_datetime);
    console.log(data);
    if (!isBase64(data.image) || (data.customer_code == null) || (!data.measure_type)) {
        return res.status(400).json({
            error: 'INVALID_DATA',
            message: "Os dados fornecidos no corpo da requisição são inválidos"
        });
    }
    //Checa se já existe no banco
    const rows = yield (0, database_1.query)(`Select * from data_record where measure_type = ? and customer_code = ? and MONTH(?) and YEAR(?)`, [data.measure_type, data.customer_code, data.measure_datetime, data.measure_datetime]);
    if (rows.length === 0) {
        const md = yield uploadImg(data.image);
        if (md.measure_value == 0) {
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: "Erro de servidor."
            });
        }
        data.uuid = generateUUID();
        yield (0, database_1.query)('INSERT INTO data_record(id, measure_type, img, measure_datetime, customer_code, image_url, measure_value) VALUES (?,?,?,?,?,?,?)', [data.uuid, data.measure_type, data.image, data.measure_datetime, data.customer_code, md.image_url, md.measure_value]);
        res.status(200).json({
            message: 'Novo registro de medição adicionado com sucesso',
            img_url: md.image_url,
            id: data.uuid,
            measure_value: md.measure_value
        });
    }
    else {
        return res.status(409).json({
            error: 'DOUBLE_REPORT',
            message: "Leitura do mês já realizada"
        });
    }
}));
app.patch('/confirm', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    "{uuid, confirmed_value}";
    if (data.measure_uuid == null) {
        return res.status(400).json({
            error: 'INVALID_DATA',
            message: "ID inválido"
        });
    }
    if (data.confirmed_value == null || typeof data.confirmed_value !== 'number') {
        return res.status(400).json({
            error: 'INVALID_DATA',
            message: "Valor de medida inválido"
        });
    }
    try {
        const rows = yield (0, database_1.query)(`Select * from data_record where id = ?`, [data.measure_uuid]);
        if (rows.length === 0) {
            return res.status(404).json({
                error: 'MEASURE_NOT_FOUND',
                message: "Leitura não encontrada." //No documento está "Leitura do mês já realizada"
            });
        }
        const record = rows[0];
        if (record.has_confirmed) {
            return res.status(409).json({
                error: 'CONFIRMATION_DUPLICATE',
                message: "Leitura do mês já realizada" //se já foi confirmado, é impossível alterar.
            });
        }
        if (record.measure_value == data.confirmed_value) {
            yield (0, database_1.query)('UPDATE data_record SET has_confirmed = true where id = ?', [data.measure_uuid]);
            res.status(200).json({
                message: 'Operação realizada com sucesso, valor confirmado.', //Apenas se o valor foi igual
            });
        }
        else {
            yield (0, database_1.query)('UPDATE data_record SET measure_value = ? where id = ?', [data.confirmed_value, data.measure_uuid]);
            res.status(200).json({
                message: 'Operação realizada com sucesso, valor alterado na base de dados.', //quando altera a primeira vez, não confirma.
            });
        }
    }
    catch (_a) {
        return res.status(400).json({
            error: 'INVALID_DATA',
            message: "ID inválido"
        });
    }
}));
app.get('/:code/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Define o código de status 200 e envia uma resposta JSON personalizada
    const measureTypeParam = req.query.measure_type;
    const { code } = req.params;
    const measure_type = typeof measureTypeParam === 'string' ? measureTypeParam.toUpperCase() : null;
    let rows = [];
    if (!measure_type) {
        rows = yield (0, database_1.query)(`SELECT id, measure_datetime, measure_type, image_url, has_confirmed
      FROM data_record WHERE customer_code = ?`, [code]);
        if (rows.length === 0) {
            return res.status(404).json({
                error_code: "MEASURES_NOT_FOUND",
                message: "Nenhuma leitura encontrada",
            });
        }
        ;
        return res.status(200).json({
            customer_code: code,
            measures: rows,
        });
    }
    if (measure_type == "WATER" || measure_type == "GAS") {
        rows = yield (0, database_1.query)(`SELECT id, measure_datetime, measure_type, image_url, has_confirmed
      FROM data_record WHERE customer_code = ? and measure_type = ?`, [code, measure_type]);
        if (rows.length === 0) {
            return res.status(404).json({
                error_code: "MEASURES_NOT_FOUND",
                message: "Nenhuma leitura encontrada",
            });
        }
        ;
        return res.status(200).json({
            customer_code: code,
            measures: rows,
        });
    }
    else {
        return res.status(400).json({
            error_code: "INVALID_TYPE",
            message: "Tipo de medição não permitida",
        });
    }
}));
// Inicia o servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${port}`);
});
