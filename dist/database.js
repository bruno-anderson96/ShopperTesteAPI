"use strict";
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
exports.pool = void 0;
exports.query = query;
const promise_1 = __importDefault(require("mysql2/promise"));
// Configuração da conexão com o MySQL
const connectionConfig = {
    host: 'db',
    user: 'root',
    database: 'shopper',
    password: '@Anderson1996',
};
// Cria uma pool de conexões
exports.pool = promise_1.default.createPool(connectionConfig);
// // Função auxiliar para executar consultas
// export async function query(sql: string, values?: any[]) {
//   const [rows] = await pool.execute(sql, values);
//   return rows;
// }
function query(sql, values) {
    return __awaiter(this, void 0, void 0, function* () {
        const [rows] = yield exports.pool.execute(sql, values);
        return rows;
    });
}
