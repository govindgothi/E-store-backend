import { v2 as cloudinary } from 'cloudinary';
import pLimit from "p-limit";
import fs from "fs/promises"; 


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary cloud name
    api_key: process.env.CLOUDINARY_API_KEY,       // Your API key
    api_secret: process.env.CLOUDINARY_API_SECRET, // Your API secret
    secure: true,
  });


const limit = pLimit(5); // max 5 concurrent uploads
const MAX_FILES = 10;

export const uploadMultipleToCloudinary = async (
  files: Express.Multer.File[],
  folder = "uploads"
) => {
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  if (files.length > MAX_FILES) {
    throw new Error(`Maximum ${MAX_FILES} files allowed`);
  }

  const uploadTasks = files.map((file) =>
    limit(async () => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder,
          resource_type: "auto",
        });

        // ✅ remove local file after successful upload
        await fs.rm(file.path, { force: true });

        return {
          public_id: result.public_id,
          secure_url: result.secure_url,
          format: result.format,
          bytes: result.bytes,
        };
      } catch (error) {
        // cleanup even if upload fails
        await fs.rm(file.path, { force: true });
        throw error;
      }
    })
  );

  // 🚀 parallel execution with controlled concurrency
  return Promise.all(uploadTasks);
};
