import { Request } from "express";
import { RowDataPacket } from "mysql2";

export interface AuthRequest extends Request {
  users: {
    SESSION_ID: number;
    USER_ID: number;
    EMAIL:string | null,
    PHONE:string | null,
    IS_PHONE_VERIFIED:number,
    IS_EMAIL_VERIFIED:number,
    ROLE:string
  };
}

export interface RegisterPayload {
  REGISTER_TYPE: string;
  EMAIL: string;
  PHONE: string;
  PASSWORD: string;
  OTP: string;
  NAME: string;
  ROLE: string;
}
export interface SessionUser extends RowDataPacket{
  USER_ID: number;
  EMAIL: string;
  PHONE: string;
  ROLE:string;
  IS_PHONE_VERIFIED: number;
  IS_EMAIL_VERIFIED: number;
}
export interface RegisterResponse {
  userId: number;
}
export interface UserRow extends RowDataPacket {
  USER_ID: number;
  EMAIL: string;
  PASSWORD: string;
  ROLE: string;
}
export interface LoginResponse {
  sessionId: number;
  token: string;
}
export interface LoginPayloadTypes {
   LOGIN_TYPE:string, 
   IS_OTP_TYPE:boolean, 
   EMAIL:string, 
   PASSWORD:string, 
   PHONE:string, 
   OTP:number, 
   ip:string
}

export interface ForgetPasswordPayload {
  OTP_PLATFORM: string;
  EMAIL: string;
  PHONE: string;
  PASSWORD: string;
  CONFIRM_PASSWORD: string;
  OTP: number;
}

export interface ZodErr {
  origin: string;
  code: string;
  formate: string;
  pattern: string;
  path: string[];
  message: string;
}
