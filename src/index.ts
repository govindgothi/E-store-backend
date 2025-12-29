import express  from 'express'
import {  type Response,type Request,type NextFunction } from 'express';
import { initDB } from './database/mysql';
import app from './app';


const PORT = process.env.PORT || 5001;
export const isProduction = process.env.NODE_ENV == 'PRODUCTION'

async function DB() {
  try {
    const conn = await initDB();
    console.log("✅ MySQL Connected Successfully");
    return conn
  } catch (err:any) {
    console.error("❌ Database Connection Failed:", err);
    process.exit(1);
  }
}

app.get('/', (_, res: Response) => {
    res.send('<h1>Express Server running with TypeScript!</h1>');
});

app.listen(PORT, async() => {
    console.log(`⚡️ [server]: Server is running at https://localhost:${PORT}`);
    await DB();
});

