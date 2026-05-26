import { v2 as cloudinary } from "cloudinary";

/**
 * Upload a file to Cloudinary.
 * @param {string} tempFilePath - Temp path from express-fileupload
 * @param {string} folder       - Cloudinary folder (e.g. "mediflow/avatars")
 * @returns {{ public_id: string, secure_url: string }}
 */
export const uploadToCloudinary = async (tempFilePath, folder = "mediflow") => {
  const result = await cloudinary.uploader.upload(tempFilePath, {
    folder,
    resource_type: "auto",
  });
  return {
    public_id:  result.public_id,
    secure_url: result.secure_url,
  };
};

/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId
 */
export const deleteFromCloudinary = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};
