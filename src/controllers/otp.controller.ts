import { Request, Response, NextFunction } from "express";
import { query } from "../database/mysql";
import { ValidateOtp } from "../validation/otp.validation";
import { CustomError } from "../utils/errorHandler";
import { otpPayload } from "../types/otp.types";
import { checkIpLimit } from "../utils/validateIOtpRequest.utils"
import { getIpAddress, getRequestedIpStats } from "../utils/getIpAddress.utils";
export const sendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { OTP_PLATFORM, OTP_TYPE, PHONE, EMAIL }: otpPayload = req.body;
    const result = ValidateOtp.safeParse({
      OTP_PLATFORM,
      OTP_TYPE,
      PHONE,
      EMAIL,
    });
    if (!result.success) {
      let obj: Record<string, string> = {};
      result.error.issues.forEach((data) => {
        const key = String(data.path?.[0] ?? "unknown");
        obj[key] = data.message;
      });
      return res.status(404).json(new CustomError("Input value is not matched", 404, obj));
    }
    if (OTP_TYPE == "SIGNUP") {
      const userSql = `SELECT USER_ID FROM USERS WHERE EMAIL = ? AND PHONE = ?`;
      const userParam = [EMAIL || null, PHONE || null];
      const userResult = await query(userSql, userParam);
      if (userResult.length > 0) {
        return res.status(409).json(new CustomError("user already register", 409));
      }
    }
    const ip = getIpAddress(req);
    const ipdata = await getRequestedIpStats(
      ip,
      OTP_PLATFORM,
      PHONE || null,
      EMAIL || null
    );
   
    const status = checkIpLimit(ipdata);
    if (!status) {
      throw new CustomError("You are blocked due to excessive requests.", 400);
    }
    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();

    const insertIpQuery = `
  INSERT INTO IP_ADDRESS 
  (IP_ADDRESS, OTP_PLATFORM, PHONE, EMAIL, CREATED_AT)
  VALUES (?, ?, ?, ?, NOW())
`;

    const insertOtpQuery = `
  INSERT INTO OTP 
  (OTP_PLATFORM, OTP_TYPE, PHONE, EMAIL, OTP_VALUE, CREATED_AT)
  VALUES (?, ?, ?, ?, ?, NOW())
`;

    const [ipResult, otpResult] = await Promise.allSettled([
      query(insertIpQuery, [ip, OTP_PLATFORM, PHONE || null, EMAIL || null]),

      query(insertOtpQuery, [
        OTP_PLATFORM,
        OTP_TYPE,
        PHONE || null,
        EMAIL || null,
        otpValue,
      ]),
    ]);

    if (otpResult.status === "rejected") {
      throw new Error("Failed to generate OTP");
    }
    if (ipResult.status === "rejected") {
      console.warn("IP logging failed:", ipResult.reason);
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otpValue
    });
  } catch (error: any) {
    return next(
      new CustomError(error?.message || "Internal server error", error.statusCode || 500, { error: error?.message })
    );
  }
};

/*
  
  */
