import { Request } from "express";
import { IpStats } from "./validateIOtpRequest.utils";
import { selectQuery } from "../database/mysql";

export const getIpAddress = (req: Request) => {
  let ip =
    (req?.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket.remoteAddress ||
    req.ip ||
    "Unknown";
  if (ip === "::1") {
    ip = "127.0.0.1";
    console.log("Localhost Request");
  }

  return ip;
};

export const getRequestedIpStats = async (
  ip: string,
  OTP_PLATFORM: string,
  PHONE: string | null,
  EMAIL: string | null
) => {
  const sql = `SELECT  COUNT(*) AS total_requests,
              SUM(CASE WHEN CREATED_AT >= NOW() - INTERVAL 5 MINUTE THEN 1 ELSE 0 END) AS count_5_min,
              SUM(CASE WHEN CREATED_AT >= NOW() - INTERVAL 10 MINUTE THEN 1 ELSE 0 END) AS count_10_min,
              SUM(CASE WHEN CREATED_AT >= NOW() - INTERVAL 20 MINUTE THEN 1 ELSE 0 END) AS count_20_min,
              SUM(CASE WHEN CREATED_AT >= NOW() - INTERVAL 30 DAY THEN 1 ELSE 0 END) AS count_30_days
              FROM IP_ADDRESS
              WHERE 
              IP_ADDRESS = ?
              AND OTP_PLATFORM = ?
              AND (PHONE = ? OR EMAIL = ?)  
              `;

  const ipResult: IpStats[] = (await selectQuery(sql, [
    ip,
    OTP_PLATFORM,
    PHONE || null,
    EMAIL || null,
  ])) as IpStats[];
  return ipResult;
};
