import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { Request } from "express";

const UPLOAD_DIR = "uploads";
if (!existsSync(UPLOAD_DIR)) {
  fs.mkdir(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueName}${ext}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const limits = {
  fileSize: 2 * 1024 * 1024, // 2MB
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});


export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// export const uploadMultiple = (fieldName: string, maxCount = 5) =>
//   upload.array(fieldName, maxCount);

// export const uploadFields = (fields: { name: string; maxCount: number }[]) =>
//   upload.fields(fields);

export const removeTempFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.error("Temp file cleanup failed:", err);
  }
};
export const uploadFields = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // per file
    files: 15,
  },
}).fields([
  { name: "CATEGORY_IMAGE", maxCount: 2 },
  { name: "documents", maxCount: 5 },
]);

