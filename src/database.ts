import mysql from 'mysql2/promise';

// Configuração da conexão com o MySQL
const connectionConfig = {
  host: 'localhost',
  user: 'root',
  database: 'Shopper',
  password: '@Anderson1996',
};

// Cria uma pool de conexões
export const pool = mysql.createPool(connectionConfig);

// Função auxiliar para executar consultas
export async function query(sql: string, values?: any[]) {
  const [rows] = await pool.execute(sql, values);
  return rows;
}
