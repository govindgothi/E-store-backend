import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { AuthRequest, SessionUser } from "../types/auth.types";
import { CustomError } from "../utils/errorHandler";
import { verifySignToken } from "../utils/crypto.util";
import { selectQuery } from "../database/mysql";
import { string } from "zod";

export const getTokenFromRequest = (req: AuthRequest): string | null => {
  // 1. Authorization header
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    return token ?? null;
  }

  // 2. Cookie
  if (req.cookies?.auth_token) {
    return req.cookies.auth_token;
  }
  return null;
};

export const verifyJwt = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  req.users = {
    SESSION_ID: 0,
    USER_ID: 0,
    EMAIL: null,
    PHONE: null,
    IS_PHONE_VERIFIED: 0,
    IS_EMAIL_VERIFIED: 0,
    ROLE: "USER",
  };
  try {
    const signToken = getTokenFromRequest(req);
    console.log("signed", signToken);
    if (signToken == null || !signToken) {
      return res
        .status(401)
        .json(new CustomError("Unauthorise to access1", 401));
    }
    const result: { isValid: boolean; token: string } =
      verifySignToken(signToken);
    if (!result.isValid) {
      return res
        .status(401)
        .json(new CustomError("Unauthorise to access2", 401));
    }

    interface JwtPayload {
      SESSION_ID: number;
    }
    let token = result.token;
    const decoded = jwt.decode(token) as JwtPayload | null;

    if (!decoded?.SESSION_ID || decoded.SESSION_ID == null) {
      return res
        .status(404)
        .json(new CustomError("Error while getting session id", 404));
    }
    let SessionId = decoded?.SESSION_ID;
    // req.users.SESSION_ID = SessionId;
    const getUserDetail = await selectQuery<SessionUser[]>(
      ` SELECT 
        u.USER_ID,
        u.ROLE,
        u.EMAIL,
        u.PHONE,
        u.IS_PHONE_VERIFIED,
        u.IS_EMAIL_VERIFIED
        FROM LOGGED_SESSION AS ls
        JOIN USERS AS u 
        ON u.USER_ID = ls.USER_REF_ID
        WHERE ls.LOGGED_SESSION_ID = ? AND ls.CREATED_AT > NOW() - INTERVAL 7 DAY `,
      [decoded?.SESSION_ID]
    );
    console.log("getUserDetail", getUserDetail);
    if (getUserDetail.length == 0 || !getUserDetail[0]) {
      return res.status(201).json(new CustomError("Session is exired", 201));
    }
    const {
      USER_ID,
      EMAIL,
      PHONE,
      IS_PHONE_VERIFIED,
      IS_EMAIL_VERIFIED,
      ROLE,
    }: SessionUser = getUserDetail[0];
    (req.users.USER_ID = USER_ID),
      (req.users.EMAIL = EMAIL),
      (req.users.PHONE = PHONE),
      (req.users.IS_PHONE_VERIFIED = IS_PHONE_VERIFIED),
      (req.users.IS_EMAIL_VERIFIED = IS_EMAIL_VERIFIED),
      (req.users.ROLE = ROLE);
    next();
  } catch (error: any) {
    console.log(error);
    return res
      .status(400)
      .json(new CustomError("Unexpected error", 400, error.message));
  }
};

export const allowedRole =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      console.log(roles, req.users.ROLE);
      if (roles.length > 0 && roles.includes(req.users.ROLE)) {
        next();
      } else {
        return res.status(401).json(new CustomError("Unauthorise access", 401));
      }
    } catch (error) {
      return res.status(401).json(new CustomError("Unexpected error!", 400));
    }
  };
