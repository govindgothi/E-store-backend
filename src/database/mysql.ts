import mysql, { Pool, PoolConnection, RowDataPacket,ResultSetHeader } from "mysql2/promise";

let pool: Pool | null = null;

// 🧩 Create a new MySQL pool
const createNewPool = (): void => {
  pool = mysql.createPool({
    host: process.env.HOST || "localhost",
    user: process.env.USER || "root",
    password: process.env.PASSWORD || "",
    database: process.env.DATABASE || "test",
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    typeCast: (field, next) => {
      if (field.type === "DATE") return field.string();
      return next();
    },
  });

  // console.log("✅ New MySQL pool created.");
  handleDisconnect();
};

// 🧠 Reconnect logic
const handleDisconnect = async (): Promise<void> => {
  if (!pool) return createNewPool();
  try {
    const conn: PoolConnection = await pool.getConnection();
    await conn.ping();
    // console.log("🟢 MySQL connection is alive.");
    conn.release();
  } catch (err) {
    console.error("⚠️ Ping failed. Reconnecting...", err);
    setTimeout(createNewPool, 2000);
  }
};

// ✅ Execute query (safe wrapper)
export const query = async <T extends RowDataPacket[]>(
  sql: string,
  params: any[] = []
): Promise<T> => {
  try {
    if (!pool) createNewPool();
    const [rows] = await (pool as Pool).query<T>(sql, params);
    return rows;
  } catch (err) {
    console.error("❌ Query Error:", err);
    throw err;
  }
};


export const selectQuery = async <T extends RowDataPacket[]>(
  sql: string,
  params: any[] = []
): Promise<T> => {
  try {
    if (!pool) createNewPool();

    const [rows] = await (pool as Pool).query<T>(sql, params);

    return rows;
  } catch (err) {
    console.error("❌ Select Query Error:", err);
    throw err;
  }
};


export const executeQuery = async (
  sql: string,
  params: any[] = []
): Promise<ResultSetHeader> => {
  try {
    if (!pool) createNewPool();

    const [result] = await (pool as Pool).execute<ResultSetHeader>(
      sql,
      params
    );

    return result;
  } catch (err) {
    console.error("❌ Execute Query Error:", err);
    throw err;
  }
};


// ✅ Initialize DB once at startup
export const initDB = async (): Promise<void> => {
  try {
    if (!pool) createNewPool();
    const conn = await (pool as Pool).getConnection();
    await conn.ping();
    conn.release();
    // console.log("🚀 MySQL initialized successfully");
  } catch (err) {
    console.error("❌ MySQL initialization failed:", err);
    process.exit(1);
  }
};




