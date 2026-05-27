import { v2 as cloudinary } from "cloudinary";

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

export const deleteFromCloudinary = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};
