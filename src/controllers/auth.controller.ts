import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { CustomError } from "../utils/errorHandler";
import {
  ForgetPasswordPayload,
  LoginResponse,
  RegisterResponse,
} from "../types/auth.types";
import { forgetPasswordService, loginService, registerService } from "../services/auth.service";
import { SuccessResponse } from "../utils/successResponse.utils";
import { isProduction } from "../index";
import { getIpAddress } from "../utils/getIpAddress.utils";

//---------------------------REGISTER-USER----------------------------------
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;
      const result:
        | SuccessResponse<RegisterResponse>
        | CustomError
        | undefined = await registerService(payload);
      if (result) {
        return res.status(result?.statusCode).json(result);
      }
    } catch (error: any) {
      return next(
        new CustomError("Internal server error", 404, { error: error?.message })
      );
    }
  }
);

//---------------------------LOGIN-USER----------------------------------
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;
      const ip = getIpAddress(req);
      const result: CustomError | SuccessResponse<LoginResponse> | undefined =
        await loginService({ ...payload, ip });
      if (result && result.success) {
        res.cookie("auth_token", result.data.token, {
          httpOnly: true,
          secure: isProduction, // https only
          sameSite: isProduction ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
        return res.status(result?.statusCode).json(result);
      } else {
        return res.status(result?.statusCode).json(result);
      }
    } catch (error: any) {
      return next(
        new CustomError(
          error?.message || "Internal server error",
          error.statusCode || 500,
          { error: error?.message }
        )
      );
    }
  }
);

export const forgetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload: ForgetPasswordPayload = req.body;
      const result: CustomError | SuccessResponse<{}> = await forgetPasswordService(payload)
      if(result){
        return res.status(result.statusCode).json(result)
      }else{
        return res.status(400).json(new CustomError("Something went wrong",400))
      }
    } catch (error:any) {
       return res.status(500).json(new CustomError("Internal server erro",500,error.message))
    }
  }
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { USERNAME,  } = req.body;
    } catch (error) {}
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { EMAIL, PASSWORD, PHONE, OTP } = req.body;
    } catch (error) {}
  }
);

export const listOfUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
    } catch (error) {}
  }
);

export const deletUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
    } catch (error) {}
  }
);

export const deletUserSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
    } catch (error) {}
  }
);
