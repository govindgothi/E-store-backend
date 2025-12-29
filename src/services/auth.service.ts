import { success } from "zod";
import { executeQuery, query, selectQuery } from "../database/mysql";
import {
  ForgetPasswordPayload,
  LoginPayloadTypes,
  RegisterPayload,
  RegisterResponse,
  UserRow,
} from "../types/auth.types";
import { CustomError } from "../utils/errorHandler";
import { comparePassword, hashPassword } from "../utils/passwordHelper.util";
import {
  LoginInputValidation,
  ValidateForgetPasswordInpput,
  ValidateUser,
} from "../validation/auth.validation";
import { RowDataPacket } from "mysql2/promise";
import { SuccessResponse } from "../utils/successResponse.utils";
import { createJwtToken } from "../utils/jwtHelper.util";
import { createSignToken } from "../utils/crypto.util";
import { getRequestedIpStats } from "../utils/getIpAddress.utils";
import { checkIpLimit } from "../utils/validateIOtpRequest.utils";

// -----REGISTER-USER------------------------------------------------------

export const registerService = async (payload: RegisterPayload) => {
  const { REGISTER_TYPE, EMAIL, PHONE, PASSWORD, OTP, NAME, ROLE } = payload;
  //Zod validation
  const result = ValidateUser.safeParse({
    REGISTER_TYPE,
    EMAIL,
    PHONE,
    PASSWORD,
    OTP,
    NAME,
    ROLE,
  });
  if (!result.success) {
    let obj: Record<string, string> = {};
    result.error.issues.forEach((data) => {
      const key = String(data.path?.[0] ?? "unknown");
      obj[key] = data.message;
    });
    return new CustomError("Input value is not matched", 404, obj);
  }
  let registerType = "PHONE";
  if (REGISTER_TYPE === "EMAIL") {
    registerType = "EMAIL";
  }

  const checkUserSql = `SELECT * FROM USERS WHERE ${registerType} = ?`;
  const checkUser = await query(checkUserSql, [
    registerType == EMAIL ? EMAIL : PHONE,
  ]);
  if (checkUser?.length > 0) {
    return new CustomError("User already exist", 404);
  }

  const getOtpSql = `SELECT * FROM OTP WHERE ${registerType} = ? AND OTP_VALUE = ? `;
  const storeOtp = await query(getOtpSql, [
    REGISTER_TYPE === "EMAIL" ? EMAIL : PHONE,
    OTP,
  ]);
  if (!(storeOtp?.length > 0)) {
    return new CustomError("OTP value is not matched", 404, { error: "err" });
  }
  const hash = await hashPassword(PASSWORD);
  const userInsertSql = `INSERT INTO USERS (NAME, EMAIL, PASSWORD, PHONE, ROLE, IS_PHONE_VERIFIED,
                             IS_EMAIL_VERIFIED )
                             VALUES ( ?, ?, ?, ?, ?, ?, ? )`;
  const userInsertParams = [
    NAME || null,
    registerType === "EMAIL" ? EMAIL : null,
    hash,
    registerType === "PHONE" ? PHONE : null,
    ROLE,
    registerType === "PHONE" ? 1 : 0,
    registerType === "EMAIL" ? 1 : 0,
  ];

  const insertUser = await executeQuery(userInsertSql, userInsertParams);
  if (insertUser?.insertId) {
    return new SuccessResponse<RegisterResponse>(
      201,
      "User registered successfully",
      { userId: insertUser.insertId }
    );
  } else {
    return new CustomError("Failed to register user", 500);
  }
};

// ------LOGIN-USER---------------------------------------------------------

export const loginService = async (payload: LoginPayloadTypes) => {
  const { LOGIN_TYPE, IS_OTP_TYPE, EMAIL, PASSWORD, PHONE, OTP, ip } = payload;

  // Input validation
  const result = LoginInputValidation.safeParse({
    LOGIN_TYPE,
    IS_OTP_TYPE,
    EMAIL,
    PHONE,
    PASSWORD,
    OTP,
  });

  if (!result.success) {
    let obj: Record<string, string> = {};
    result.error.issues.forEach((data) => {
      const key = String(data.path?.[0] ?? "unknown");
      obj[key] = data.message;
    });
    return new CustomError("Input value is not matched", 404, obj);
  }

  // Rate limiting
  const ipdata = await getRequestedIpStats(
    ip,
    LOGIN_TYPE,
    PHONE || null,
    EMAIL || null
  );
  const status = checkIpLimit(ipdata);
  if (!status) {
    throw new CustomError("You are blocked due to excessive requests.", 400);
  }

  const insertIpQuery = `
    INSERT INTO IP_ADDRESS 
    (IP_ADDRESS, OTP_PLATFORM, PHONE, EMAIL, CREATED_AT)
    VALUES (?, ?, ?, ?, NOW())
  `;
  await query(insertIpQuery, [ip, LOGIN_TYPE, PHONE || null, EMAIL || null]);

  // Helper functions
  const Sessions = async (userId: number) => {
    const logSession = await selectQuery(
      "SELECT * FROM LOGGED_SESSION WHERE USER_REF_ID = ? AND CREATED_AT > NOW() - INTERVAL 120 MINUTE",
      [userId]
    );
    return logSession;
  };

  const deleteOldSessionHelper = async (sessionId: number) => {
    if (!sessionId || typeof sessionId !== "number") {
      return new CustomError("Invalid sessionId", 400);
    }
    const result = await executeQuery(
      `DELETE FROM LOGGED_SESSION WHERE LOGGED_SESSION_ID = ?`,
      [sessionId]
    );
    if (result.affectedRows === 0) {
      return new CustomError("No session found with the provided ID", 404);
    }
  };

  const createNewSessionHelper = async (userId: number, role: string) => {
    if (!userId || typeof userId !== "number" || !role) {
      return new CustomError("Invalid userId or role", 400);
    }
    const result = await executeQuery(
      `INSERT INTO LOGGED_SESSION (USER_REF_ID,USER_ROLE) VALUES (?,?)`,
      [userId, role]
    );
    if (!result.insertId) {
      return new CustomError("Failed to create session", 500);
    }
    const token = createJwtToken({ SESSION_ID: result.insertId, ROLE: role });
    const sign = createSignToken(token);
    return new SuccessResponse(201, "Session created successfully", {
      sessionId: result.insertId,
      token: `${token}.${sign}`,
    });
  };

  const handleSessionManagement = async (userId: number) => {
    let LoggedSession = await Sessions(userId);
    if (LoggedSession.length > 3 && LoggedSession[0]?.LOGGED_SESSION_ID) {
      await deleteOldSessionHelper(LoggedSession[0].LOGGED_SESSION_ID);
    }
    return await createNewSessionHelper(userId, "CUSTOMER");
  };

  // Dynamic login configuration
  const loginConfig: Record<string, { field: string; value: any }> = {
    EMAIL: {
      field: "EMAIL",
      value: EMAIL,
    },
    PHONE: {
      field: "PHONE",
      value: PHONE,
    },
  };

  const config = loginConfig[LOGIN_TYPE];
  if (!config) {
    return new CustomError("Invalid login type", 400);
  }

  // Password-based login
  if (!IS_OTP_TYPE) {
    const userSql = `SELECT USER_ID, EMAIL, PASSWORD, ROLE FROM USERS WHERE ${config.field} = ?`;
    const users = await selectQuery<UserRow[]>(userSql, [config.value]);

    if (
      users.length === 0 ||
      !users[0]?.PASSWORD ||
      !(await comparePassword(PASSWORD, users[0].PASSWORD))
    ) {
      return new CustomError("Invalid Credentials", 404);
    }

    return await handleSessionManagement(users[0].USER_ID);
  }

  // OTP-based login
  if (IS_OTP_TYPE) {
    let getOtpQuery = `SELECT * FROM OTP WHERE OTP_PLATFORM = ? AND OTP_TYPE = ? AND OTP_VALUE = ? AND ${config.field} = ? AND CREATED_AT > NOW() - INTERVAL 2 MINUTE`;
    let getOtpParams = [LOGIN_TYPE, "LOGIN", OTP, config.value];
    const resultOtp = await selectQuery(getOtpQuery, getOtpParams);

    if (!resultOtp || resultOtp.length === 0) {
      return new CustomError("OTP is expired on given gmail", 404);
    }

    const userId = resultOtp[0]?.USER_REF_ID;
    if (userId == null || !userId) {
      return new CustomError("User is not found", 404);
    }

    return await handleSessionManagement(userId);
  }

  return new CustomError("something went wrong", 400);
};

// -------FORGERT-PASSWORD---------------------------------------------------

export const forgetPasswordService = async (payload: ForgetPasswordPayload) => {
  const { OTP_PLATFORM, EMAIL, PHONE, PASSWORD, CONFIRM_PASSWORD, OTP } =
    payload;
  const result = ValidateForgetPasswordInpput.safeParse({
    OTP_PLATFORM,
    EMAIL,
    PHONE,
    PASSWORD,
    CONFIRM_PASSWORD,
    OTP,
  });
  if (!result.success) {
    console.log(result);
    let obj: Record<string, string> = {};
    result.error.issues.forEach((data) => {
      const key = String(data.path?.[0] ?? "unknown");
      obj[key] = data.message;
    });
    return new CustomError("Input value is not matched", 404, obj);
  }

  const verifyOtpSql = `
      SELECT * FROM OTP 
      WHERE OTP_PLATFORM = ? 
      AND ${OTP_PLATFORM} = ? 
      AND OTP_VALUE = ? 
      AND OTP_TYPE = ?
      AND CREATED_AT >= DATE_SUB(NOW(), INTERVAL 2 MINUTE)
      AND IS_VALID = 1
      `;
  const verifyOtpParams = [
    OTP_PLATFORM,
    OTP_PLATFORM == "EMAIL" ? EMAIL : PHONE,
    OTP,
    "FORGET_PASSWORD",
  ];
  const verifyOtpResult = await selectQuery(verifyOtpSql, verifyOtpParams);
  console.log(verifyOtpResult);
  const isOtpValidFalse = await executeQuery(
    `UPDATE OTP SET IS_VALID = 0 WHERE ${OTP_PLATFORM} = ?`,
    [OTP_PLATFORM == "EMAIL" ? EMAIL : PHONE]
  );
  if (!verifyOtpResult || verifyOtpResult.length == 0) {
    return new CustomError("OTP value is not matched or exired!", 404);
  }
  const hash = await hashPassword(PASSWORD);
  if (!hash) {
    return new CustomError("Error while secure password", 400);
  }
  const updatePasswordQuery = `UPDATE USERS SET PASSWORD = ? WHERE ${OTP_PLATFORM} = ? AND DELETED = 0`;
  const updatePasswordParam = [hash, OTP_PLATFORM == "EMAIL" ? EMAIL : PHONE];
  const updatePasswordResult: null | any = await executeQuery(
    updatePasswordQuery,
    updatePasswordParam
  );
  if (updatePasswordResult.affectedRows == 0) {
    return new CustomError("Error while updating password", 400);
  }
  if (updatePasswordResult.affectedRows == 1) {
    return new SuccessResponse(201, "Password updated successfuly", {});
  }
  return new CustomError("Something is went wrng!", 400);
};

// LOGGED OUT ALL SESSION

// LOGGED OUT USER 

// 
