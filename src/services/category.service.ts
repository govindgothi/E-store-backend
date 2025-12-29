import { RowDataPacket } from "mysql2";
import { executeQuery, selectQuery } from "../database/mysql";
import {
  CategoryListPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.types";
import { CustomError } from "../utils/errorHandler";
import {
  ValidateCategoryPayload,
  ValidateUpdateCategoryPayload,
} from "../validation/category.validation";
import { SuccessResponse } from "../utils/successResponse.utils";
import { FileType } from "../types/constant.types";
import { uploadMultipleToCloudinary } from "../providers/cloudinary.provider";

//CREATE CATEGORY SERVICE
export const createCategoryService = async (payload: CreateCategoryPayload,files:Express.Multer.File[]) => {
  const { USER_ID, CATEGORY_NAME, CATEGORY_DESCRIPTION } = payload;
  const result = ValidateCategoryPayload.safeParse({
    USER_ID,
    CATEGORY_NAME,
    CATEGORY_DESCRIPTION,
  });
  console.log(await uploadMultipleToCloudinary(files,"uploads"))
  if (!result.success) {
    console.log(result);
    let obj: Record<string, string> = {};
    result.error.issues.forEach((data) => {
      const key = String(data.path?.[0] ?? "unknown");
      obj[key] = data.message;
    });
    return new CustomError("Input value is not matched", 404, obj);
  }
  const insertCategoryQuery = `INSERT INTO CATEGORY (USER_REF_ID, CATEGORY_NAME, CATEGORY_DESCRIPTION) VALUES (?,?,?)`;
  const insertCategoryParams = [USER_ID, CATEGORY_NAME, CATEGORY_DESCRIPTION];
  const createdCategory = await executeQuery(
    insertCategoryQuery,
    insertCategoryParams
  );
  if (createdCategory.affectedRows == 1 && createdCategory.insertId) {
    return new SuccessResponse(201, "Category created succesfully", {
      CATEGORY_ID: createdCategory.insertId,
    });
  } else {
    return new CustomError("Error while create category", 400);
  }
};
// UPDATE CATEGORY SERVICE
export const updateCategoryService = async (payload: UpdateCategoryPayload) => {
  const { USER_ID, CATEGORY_ID, CATEGORY_DESCRIPTION, CATEGORY_NAME } = payload;
  const result = ValidateUpdateCategoryPayload.safeParse({
    USER_ID,
    CATEGORY_ID,
    CATEGORY_NAME,
    CATEGORY_DESCRIPTION,
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
  let updateCategoryParams = [];
  let updateValues: string[] = [];
  if (
    CATEGORY_DESCRIPTION !== "" &&
    CATEGORY_DESCRIPTION != null &&
    CATEGORY_DESCRIPTION != undefined
  ) {
    updateValues.push("CATEGORY_DESCRIPTION");
    updateCategoryParams.push(CATEGORY_DESCRIPTION);
  }
  if (
    CATEGORY_NAME !== "" &&
    CATEGORY_NAME != null &&
    CATEGORY_NAME != undefined
  ) {
    updateValues.push("CATEGORY_NAME");
    updateCategoryParams.push(CATEGORY_NAME);
  }
  const updateCategoryQuery = `UPDATE CATEGORY SET ${updateValues.join(
    ","
  )} WHERE USER_ID = ? AND CATEGORY_ID AND DELETED = ?`;
  updateCategoryParams.push(USER_ID, CATEGORY_ID, 0);
  const updatedResult = await executeQuery(
    updateCategoryQuery,
    updateCategoryParams
  );
  if (updatedResult.affectedRows == 1) {
    return new SuccessResponse(200, "Category updated successful", {});
  } else {
    return new CustomError("Category is not found", 404);
  }
};
// CATEGORY LIST SERVICE
export const categoryListService = (payload:CategoryListPayload) => {
 const {LIMIT,PAGE,CATEGORY_ID, CATEGORY_NAME} = payload
 const OFFSET = (PAGE-1) * LIMIT 

 let listQuery = `SELECT CATEGORY_ID, CATEGORY_NAME,CATEGORY_DESCRIPTION `
};
export const deleteCategoryService = () => {};
