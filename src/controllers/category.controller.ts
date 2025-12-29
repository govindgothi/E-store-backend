import { NextFunction, Response, Request } from "express";
import { CustomError } from "../utils/errorHandler";
import {
  CategoryListPayload,
  CategoryListResponse,
  CreateCategoryPayload,
  CreateCategoryResponse,
  DeleteCategoryPayload,
  DeleteCategoryResponse,
  UpdateCategoryPayload,
  UpdateCategoryResponse,
} from "../types/category.types";
import { SuccessResponse } from "../utils/successResponse.utils";
import {
  categoryListService,
  createCategoryService,
  deleteCategoryService,
  updateCategoryService,
} from "../services/category.service";
import { AuthRequest } from "../types/auth.types";
import { FileType } from "../types/constant.types";
import { uploadFilesService } from "../utils/uploadFile.utils";
import { file } from "zod";

// CREATE CATEGORY
export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const USER_ID: number = req.users.USER_ID;
    let payload = req.body;
    const files:SuccessResponse<Express.Multer.File[]> | CustomError= await uploadFilesService(req)
    if(files && !files?.success){
     return res.status(files.statusCode).json(files)
    }
    const data: CreateCategoryPayload = { ...payload, USER_ID };
    const result: CustomError | SuccessResponse<CreateCategoryResponse> =
      await createCategoryService(data,files.data);
    if (result) {
      return res.status(result.statusCode).json(result);
    } else {
      return res
        .status(400)
        .json(
          new CustomError("Something went wrong while category create!", 400)
        );
    }
  } catch (error: any) {
    // return res
    //   .status(500)
    //   .json(new CustomError("Internal server erro", 500, error.message));
  }
};
// UPDATE CATEGORY
export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const USER_ID = req.users.USER_ID;
    const payload: UpdateCategoryPayload = req.body;
    let data = { ...payload, USER_ID };
    const result: CustomError | SuccessResponse<{}> =
      await updateCategoryService(data);
    if (result) {
      return res.status(result.statusCode).json(result);
    } else {
      return res
        .status(400)
        .json(
          new CustomError("Something went wrong while category create!", 400)
        );
    }
  } catch (error: any) {
    return res
      .status(500)
      .json(new CustomError("Internal server erro", 500, error.message));
  }
};
// CATEGORY LIST
export const categoryList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.query;
    const data: CategoryListPayload = {
      ...payload,
      LIMIT:
        payload?.LIMIT && Number(payload.LIMIT) > 9
          ? Number(payload.LIMIT)
          : 10,

      PAGE:
        payload?.PAGE && Number(payload.PAGE) > 0 ? Number(payload.PAGE) : 1,
    };
    const result: CustomError | SuccessResponse<CategoryListResponse> =
      await categoryListService(data);
    if (result) {
      return res.status(result.statusCode).json(result);
    } else {
      return res
        .status(400)
        .json(
          new CustomError("Something went wrong fetching category data", 400)
        );
    }
  } catch (error: any) {
    return res
      .status(500)
      .json(new CustomError("Internal server erro", 500, error.message));
  }
};
// CATEGORY BY ID
export const categoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload: CategoryListPayload = req.query;
    const result: CustomError | SuccessResponse<CategoryListResponse> =
      await categoryListService(payload);
    if (result) {
      return res.status(result.statusCode).json(result);
    } else {
      return res
        .status(400)
        .json(
          new CustomError("Something went wrong fetching category data", 400)
        );
    }
  } catch (error: any) {
    return res
      .status(500)
      .json(new CustomError("Internal server erro", 500, error.message));
  }
};

// DELETED CATEGORY
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { CATEGORY_ID: DeleteCategoryPayload } = req.params;
    const result: CustomError | SuccessResponse<DeleteCategoryResponse> =
      await deleteCategoryService(CATEGORY_ID);
    if (result) {
      return res.status(result.statusCode).json(result);
    } else {
      return res
        .status(400)
        .json(
          new CustomError("Something went wrong while category create!", 400)
        );
    }
  } catch (error: any) {
    return res
      .status(500)
      .json(new CustomError("Internal server erro", 500, error.message));
  }
};
