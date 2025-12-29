// uploadService.ts
import { Request } from "express";
import { CustomError } from "./errorHandler";
import { SuccessResponse } from "./successResponse.utils";

export const uploadFilesService = async (req: Request) => {
  const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!filesMap) {
    throw new CustomError("No files uploaded", 400);
  }

  // Normalize → ALWAYS array
  const files: Express.Multer.File[] = Object.values(filesMap).flat();

  if (!files.length) {
    throw new CustomError("No files uploaded", 400);
  }

  // Combined size validation
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > 20 * 1024 * 1024) {
    throw new CustomError("Total size exceeds 20MB", 400);
  }

  return new SuccessResponse(201, "Files uploaded successfully", files);
};
